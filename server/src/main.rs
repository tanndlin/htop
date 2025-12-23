use std::{
    sync::{Arc, Mutex},
    thread,
};

use axum::{
    Json, Router,
    body::Bytes,
    extract::{
        State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    http::{Method, response},
    routing::get,
};
use sysinfo::{MINIMUM_CPU_UPDATE_INTERVAL, System};
use tower_http::cors::{Any, CorsLayer};

use crate::types::{CpuInfo, InfoType, RamInfo, RequestMessage, ResponseData, ResponseMessage};

mod types;

#[tokio::main]
async fn main() {
    println!("Starting server...");

    let sys = Arc::new(Mutex::new(System::new_all()));

    // build our application with a single route
    let app = Router::new()
        .route(
            "/api/cpus",
            get(get_cpu).with_state(AppState { sys: sys.clone() }),
        )
        .route(
            "/api/ram",
            get(get_ram).with_state(AppState { sys: sys.clone() }),
        )
        .route("/ws", get(get_websocket).with_state(AppState { sys }));

    let app = if cfg!(debug_assertions) {
        app.layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods([Method::GET, Method::POST])
                .allow_headers(Any),
        )
    } else {
        app
    };

    // run our app with hyper, listening globally on port 3000
    let api_port = std::env::var("API_PORT").expect("API_PORT environment variable not set");
    println!("Server running on 0.0.0.0:{api_port}");
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{api_port}"))
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[derive(Clone)]
struct AppState {
    sys: Arc<Mutex<System>>,
}

#[axum::debug_handler]
async fn get_cpu(State(state): State<AppState>) -> Json<CpuInfo> {
    let mut sys = state.sys.lock().unwrap();
    Json(get_cpu_info(&mut sys))
}

#[axum::debug_handler]
async fn get_ram(State(state): State<AppState>) -> Json<RamInfo> {
    let mut sys = state.sys.lock().unwrap();
    Json(get_ram_info(&mut sys))
}

fn get_cpu_info(sys: &mut System) -> CpuInfo {
    sys.refresh_cpu_all();
    thread::sleep(MINIMUM_CPU_UPDATE_INTERVAL);
    sys.refresh_cpu_all();

    let cpu_usages: Vec<_> = sys.cpus().iter().map(sysinfo::Cpu::cpu_usage).collect();

    CpuInfo { cpu_usages }
}

fn get_ram_info(sys: &mut System) -> RamInfo {
    sys.refresh_memory();

    let total = sys.total_memory();
    let used = sys.used_memory();

    RamInfo {
        total,
        used,
        free: total - used,
    }
}

async fn get_websocket(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl axum::response::IntoResponse {
    ws.on_upgrade(move |socket| handle_websocket(socket, state))
}

async fn handle_websocket(mut socket: WebSocket, state: AppState) {
    while let Some(Ok(msg)) = socket.recv().await {
        let bytes = match msg {
            Message::Text(text) => Some(text.into()),
            Message::Binary(bytes) => Some(bytes),
            e => {
                eprintln!("Unsupported message type {e:?}");
                None
            }
        };

        if let Some(bytes) = bytes {
            match handle_request_message_received(bytes, state.sys.as_ref()) {
                Ok(res) => {
                    if let Err(e) = socket.send(res).await {
                        eprintln!("Error sending message: {e}");
                    }
                }
                Err(e) => eprintln!("Error on parsing recv message: {e}"),
            }
        }
    }
}

fn handle_request_message_received(bytes: Bytes, sys: &Mutex<System>) -> Result<Message, String> {
    let msg = RequestMessage::try_from(bytes)?;

    let mut sys = sys.lock().unwrap();
    let response_data = match msg.info_type {
        InfoType::CPU => ResponseData::CpuInfo(get_cpu_info(&mut sys)),
        InfoType::RAM => ResponseData::RamInfo(get_ram_info(&mut sys)),
    };

    Ok(Message::Binary(
        ResponseMessage {
            info_type: msg.info_type,
            data: response_data,
        }
        .into(),
    ))
}
