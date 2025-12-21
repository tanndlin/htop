use std::{
    sync::{Arc, Mutex},
    thread,
};

use axum::{Router, extract::State, routing::get};
use sysinfo::{MINIMUM_CPU_UPDATE_INTERVAL, System};

#[tokio::main]
async fn main() {
    // build our application with a single route
    let app = Router::new().route("/", get(get_root)).route(
        "/api/cpus",
        get(get_cpu).with_state(AppState {
            sys: Arc::new(Mutex::new(System::new_all())),
        }),
    );

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("127.0.0.1:7032")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[derive(Clone)]
struct AppState {
    sys: Arc<Mutex<System>>,
}

async fn get_root() -> String {
    "Hello, World!".to_string()
}

async fn get_cpu(State(state): State<AppState>) -> String {
    use std::fmt::Write;
    let mut sys = state.sys.lock().unwrap();

    sys.refresh_cpu_all();
    thread::sleep(MINIMUM_CPU_UPDATE_INTERVAL);
    sys.refresh_cpu_all();

    let mut s = String::new();
    for (i, cpu) in sys.cpus().iter().enumerate() {
        let i = i + 1;
        let usage = cpu.cpu_usage();
        writeln!(&mut s, "CPU {i} {usage}%").unwrap();
    }
    s
}
