use crate::errors::UnoError;
use crate::game::parse_message_to_action;
use crate::gamestate::{new_game, GameStatesMutex, Gamestate};
use crate::lobby::parse_lobby_message_to_action;
use crate::sendable_gamestate::{get_sendable_gamestate, SendableGamestate};
use crate::User;
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use std::convert::TryInto;
use tokio::sync::mpsc;
use tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};
use tokio_stream::wrappers::UnboundedReceiverStream;
use uuid::Uuid;
use warp::ws::{Message, WebSocket};

#[derive(Serialize, Deserialize, Debug)]
struct Introduction {
    user_id: Option<String>,
    room_id: Option<String>,
    name: Option<String>,
}

pub async fn on_connection(ws: WebSocket, gamestates: GameStatesMutex) {
    let (tx, rx): (
        UnboundedSender<Result<Message, warp::Error>>,
        UnboundedReceiver<Result<Message, warp::Error>>,
    ) = mpsc::unbounded_channel();
    let rx = UnboundedReceiverStream::new(rx);

    let (user_ws_tx, mut user_ws_rx) = ws.split();
    tokio::task::spawn(rx.forward(user_ws_tx));

    let result = user_ws_rx
        .next()
        .await
        .expect("websocket error during introductions");

    let (room_id, user_id) = match result {
        Ok(result) => introduce(&gamestates, result, tx.clone()).await,
        Err(_) => Err(UnoError::InvalidState(
            "websocket error during introductions".to_string(),
        )),
    }
    .expect("cannot");

    {
        let gamestate_lock = gamestates.read().await;
        let gamestate = gamestate_lock.get(&room_id).unwrap();
        validate_locks(&gamestate).await;
        let user_lock = gamestate.users.read().await;
        let user = user_lock.get(&user_id).unwrap();
        deal_hand(&gamestate, &user).await;
        send_gamestate_to_all(&gamestate).await;
    }

    while let Some(result) = user_ws_rx.next().await {
        let gamestate_lock = gamestates.read().await;
        let gamestate = gamestate_lock.get(&room_id).unwrap();
        validate_locks(&gamestate).await;
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("websocket error(uid={}): {}", user_id, e);
                break;
            }
        };

        match parse_lobby_message_to_action(&gamestate, msg, &user_id).await {
            Ok(_) => (),
            Err(e) => println!("Error: {:#?}", e),
        }
        send_gamestate_to_all(&gamestate).await;
        if *gamestate.game_started.read().await {
            break;
        }
    }

    while let Some(result) = user_ws_rx.next().await {
        let gamestate_lock = gamestates.read().await;
        let gamestate = gamestate_lock.get(&room_id).unwrap();
        let user_lock = gamestate.users.read().await;
        let user = user_lock.get(&user_id).unwrap();
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("websocket error(uid={}): {}", user.uuid, e);
                break;
            }
        };
        match parse_message_to_action(&gamestate, msg, &user).await {
            Ok(_) => (),
            Err(e) => println!("Error: {:#?}", e),
        }
        send_gamestate_to_all(&gamestate).await;
    }
}

pub async fn deal_hand(gamestate: &Gamestate, user: &User) {
    let mut hands = gamestate.hands.write().await;
    if hands.get(&user.table_pos).is_none() {
        let mut deck = gamestate.deck.write().await;
        let mut hand = Vec::new();
        for _ in 0..7 {
            hand.push(deck.pop().unwrap());
        }
        hands.insert(user.table_pos, hand);
    }
}

async fn introduce(
    gamestates: &GameStatesMutex,
    message: Message,
    tx: mpsc::UnboundedSender<Result<Message, warp::Error>>,
) -> Result<(u128, u128), UnoError> {
    let string_message = message.to_str()?;
    println!(
        "incoming intro message: {:?}",
        // serde_json::to_string(&LobbyAction::StartGame()).unwrap(),
        string_message,
    );
    let intro: Introduction = serde_json::from_str(string_message)?;

    let room_id = match intro.room_id {
        None => {
            let gamestate = new_game();
            println!("Generating new game with id: {}", gamestate.room_id);
            gamestates
                .write()
                .await
                .insert(gamestate.room_id, gamestate.clone());
            gamestate.room_id
        }
        Some(room_id) => room_id.parse::<u128>().expect("uuid is not a valid u128"),
    };

    let gamestate_lock = gamestates.read().await;
    let gamestate = gamestate_lock.get(&room_id).ok_or(UnoError::InvalidRoom)?;

    let mut users = gamestate.users.write().await;
    let user_id = match intro.user_id {
        None => {
            let uuid = Uuid::new_v4().as_u128();
            println!("New user! Assigning them uid {}", uuid);
            let user = User {
                uuid,
                tx,
                table_pos: users.len().try_into().unwrap(),
                name: intro.name,
            };
            users.insert(uuid, user.clone());
            uuid
        }
        Some(user_id) => {
            println!("user {} connected with existing", user_id);
            let uuid = user_id.parse::<u128>().expect("uuid is not a valid u128");
            let user_opt = users.get(&uuid);
            let user = match user_opt {
                Some(user) => {
                    println!("User {} is already in game, reconnecting them", uuid);
                    let mut name = user.name.clone();
                    if intro.name.is_some() {
                        name = intro.name;
                    }
                    User {
                        uuid: user.uuid,
                        table_pos: user.table_pos,
                        name,
                        tx,
                    }
                }
                None => User {
                    uuid,
                    tx,
                    table_pos: users.len().try_into().unwrap(),
                    name: intro.name,
                },
            };
            users.insert(uuid, user.clone());
            uuid
        }
    };
    return Ok((room_id, user_id));
}

pub async fn user_disconnected(gamestate: &Gamestate, uuid: u128) {
    println!(
        "user {} disconnected, leaving their data in table in case of rejoin",
        uuid
    );

    // gamestate.users.write().await.remove(&uuid);
    send_gamestate_to_all(gamestate).await;
}

async fn send_gamestate_to_user(gamestate: &Gamestate, user: &User) {
    let sendable_gamestate: SendableGamestate = get_sendable_gamestate(&gamestate, user).await;
    gamestate
        .users
        .read()
        .await
        .get(&user.uuid)
        .expect("couldnt find user to send gamestate to")
        .tx
        .send(Ok(Message::text(
            serde_json::to_string(&sendable_gamestate).unwrap(),
        )))
        .expect("Cannot send message");
}

async fn send_gamestate_to_all(gamestate: &Gamestate) {
    for (_, user) in gamestate.users.read().await.iter() {
        send_gamestate_to_user(gamestate, user).await;
    }
}

pub async fn validate_locks(gamestate: &Gamestate) {
    match gamestate.deck.try_read() {
        Ok(_) => println!("Deck Read Ok"),
        Err(_) => println!("Deck Read is locked!"),
    }
    match gamestate.users.try_read() {
        Ok(_) => println!("Users Read Ok"),
        Err(_) => println!("Users Read is locked!"),
    }
    match gamestate.hands.try_read() {
        Ok(_) => println!("Hands Read Ok"),
        Err(_) => println!("Hands Read is locked!"),
    }
    match gamestate.discard.try_read() {
        Ok(_) => println!("Discard Read Ok"),
        Err(_) => println!("Discard Read is locked!"),
    }

    match gamestate.deck.try_write() {
        Ok(_) => println!("Deck Write Ok"),
        Err(_) => println!("Deck Write is locked!"),
    }
    match gamestate.users.try_write() {
        Ok(_) => println!("Users write Ok"),
        Err(_) => println!("Users write is locked!"),
    }
    match gamestate.hands.try_write() {
        Ok(_) => println!("Hands write Ok"),
        Err(_) => println!("Hands write is locked!"),
    }
    match gamestate.discard.try_write() {
        Ok(_) => println!("Discard write Ok"),
        Err(_) => println!("Discard write is locked!"),
    }
}
