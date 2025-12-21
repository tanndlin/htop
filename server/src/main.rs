use std::{
    sync::{Arc, Mutex},
    thread,
};

use axum::{Json, Router, extract::State, http::Method, response::IntoResponse, routing::get};
use sysinfo::{MINIMUM_CPU_UPDATE_INTERVAL, System};
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    // build our application with a single route
    let app = Router::new().route(
        "/api/cpus",
        get(get_cpu).with_state(AppState {
            sys: Arc::new(Mutex::new(System::new_all())),
        }),
    );

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
    println!("Server running on 0.0.0.0:{}", api_port);
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", api_port))
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[derive(Clone)]
struct AppState {
    sys: Arc<Mutex<System>>,
}

#[axum::debug_handler]
async fn get_cpu(State(state): State<AppState>) -> impl IntoResponse {
    let mut sys = state.sys.lock().unwrap();

    sys.refresh_cpu_all();
    thread::sleep(MINIMUM_CPU_UPDATE_INTERVAL);
    sys.refresh_cpu_all();

    let v: Vec<_> = sys.cpus().iter().map(|cpu| cpu.cpu_usage()).collect();
    Json(v)
}
