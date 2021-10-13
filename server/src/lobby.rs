use crate::connections::user_disconnected;
use crate::errors::UnoError;
use crate::gamestate::Gamestate;
use crate::User;

use serde::{Deserialize, Serialize};
use warp::ws::Message;

#[derive(Serialize, Deserialize, Debug)]
enum LobbyAction {
    SetName(String),
    StartGame(),
}

pub async fn parse_lobby_message_to_action(
    gamestate: &Gamestate,
    message: Message,
    user: &User,
) -> Result<(), UnoError> {
    if message.is_close() {
        user_disconnected(gamestate, user.uuid).await;
        return Ok(());
    }

    let string_message = message.to_str()?;
    println!("incoming message: {}", string_message);

    let action: LobbyAction = serde_json::from_str(string_message)?;
    match action {
        LobbyAction::SetName(new_name) => set_name(gamestate, user.table_pos, new_name).await?,
        LobbyAction::StartGame() => start_game().await?,
    }

    Ok(())
}

pub async fn set_name(
    gamestate: &Gamestate,
    user_pos: u128,
    new_name: String,
) -> Result<(), UnoError> {
    let mut users = gamestate.users.write().await;

    let mut user = users[&user_pos].clone();
    user.name = Some("Sam".to_string());
    *users.get_mut(&user_pos).unwrap() = user;

    return Ok(());
}

pub async fn start_game() -> Result<(), UnoError> {
    Ok(())
}
