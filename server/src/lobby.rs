use crate::errors::UnoError;
use crate::gamestate::Gamestate;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum LobbyAction {
    SetName(String),
    StartGame(),
}

pub async fn parse_lobby_string_to_action(
    gamestate: &Gamestate,
    user_id: &u128,
    string_message: &str,
) -> Result<(), UnoError> {
    let action: LobbyAction = serde_json::from_str(&string_message).unwrap();

    match action {
        LobbyAction::SetName(new_name) => set_name(gamestate, user_id, new_name).await?,
        LobbyAction::StartGame() => start_game(gamestate).await?,
    }
    Ok(())
}

pub async fn set_name(
    gamestate: &Gamestate,
    user_id: &u128,
    new_name: String,
) -> Result<(), UnoError> {
    let mut users = gamestate.users.write().await;
    let mut user = users.get(user_id).unwrap().clone();
    user.name = Some(new_name);
    *users.get_mut(user_id).unwrap() = user;

    return Ok(());
}

pub async fn start_game(gamestate: &Gamestate) -> Result<(), UnoError> {
    let mut game_started = gamestate.game_started.write().await;
    *game_started = true;
    Ok(())
}
