mod card;
mod connections;
mod errors;
mod game;
mod gamestate;
mod sendable_gamestate;
mod user;

use connections::on_connection;
use game::generate_deck;
use gamestate::{GameStatesMutex, Gamestate};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::sync::RwLock;
use user::User;
use uuid::Uuid;
use warp::Filter;

#[tokio::main]
async fn main() {
    println!("Uno flash!");

    let (ip, port) = match std::env::var("PORT") {
        Ok(port) => (
            [0, 0, 0, 0],
            port.parse::<u16>().expect("cannot parse port"),
        ),
        Err(_) => ([127, 0, 0, 1], 3030),
    };

    println!("port: {}", port);

    let gamestates: GameStatesMutex = Arc::new(RwLock::new(HashMap::new()));
    let gamestates = warp::any().map(move || gamestates.clone());

    let site = warp::get()
        .and(warp::fs::dir("client/build/"))
        .or(warp::fs::file("client/build/index.html"))
        .with(warp::log("warp::filters::fs"));
    let ws = warp::path("ws").and(warp::ws()).and(gamestates).map(
        |ws: warp::ws::Ws, gamestate: GameStatesMutex| {
            ws.on_upgrade(move |websocket| on_connection(websocket, gamestate))
        },
    );

    let routes = warp::get().and(ws).or(site);
    // .and(site.or(ws));

    // let lock_expiry = SystemTime::now() + Duration::from_secs(3);

    warp::serve(routes).run((ip, port)).await;
}
