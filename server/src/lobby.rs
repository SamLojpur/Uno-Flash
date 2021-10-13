use crate::connections::user_disconnected;
use crate::errors::UnoError;
use crate::gamestate::Gamestate;

use serde::{Deserialize, Serialize};
use warp::ws::Message;

#[derive(Serialize, Deserialize, Debug)]
pub enum LobbyAction {
    SetName(String),
    StartGame(),
}

pub async fn parse_lobby_message_to_action(
    gamestate: &Gamestate,
    message: Message,
    user_id: &u128,
) -> Result<(), UnoError> {
    if message.is_close() {
        user_disconnected(gamestate, *user_id).await;
        return Ok(());
    }

    let string_message = message.to_str()?;
    println!("incoming lobby message: {}", string_message);

    let action: LobbyAction = serde_json::from_str(string_message).expect("27");
    println!("incoming lobby message: {:#?}", action);

    match action {
        LobbyAction::SetName(new_name) => set_name(gamestate, user_id, new_name).await?,
        LobbyAction::StartGame() => start_game(gamestate).await?,
    }

    println!("name set");

    Ok(())
}

pub async fn set_name(
    gamestate: &Gamestate,
    user_id: &u128,
    new_name: String,
) -> Result<(), UnoError> {
    let mut users = gamestate.users.write().await;
    let mut user = users.get(&user_id).unwrap().clone();
    user.name = Some(new_name);
    *users.get_mut(&user_id).unwrap() = user;

    return Ok(());
}

pub async fn start_game(gamestate: &Gamestate) -> Result<(), UnoError> {
    let mut game_started = gamestate.game_started.write().await;
    *game_started = true;
    Ok(())
}
