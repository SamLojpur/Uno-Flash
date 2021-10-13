use crate::card;
use crate::gamestate;
use crate::User;

use card::{Card, Color, Value};
use gamestate::Gamestate;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize, Deserialize, Debug)]
pub struct SendableGamestate {
    room_id: String,
    game_started: bool,
    winner: Option<String>,
    user_id: String,
    table_pos: u128,
    discard: Vec<SendableCard>,
    deck: Vec<AnonymousCard>,
    hands: HashMap<u128, PossiblyAnonHand>,
    users: Vec<SendableUser>,
    test: (SendableCard, Color),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SendableUser {
    pub table_pos: u128,
    pub name: Option<String>,
    pub uuid: String,
}

impl From<User> for SendableUser {
    fn from(user: User) -> SendableUser {
        return SendableUser {
            table_pos: user.table_pos,
            name: user.name,
            uuid: user.uuid.to_string(),
        };
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SendableCard {
    pub id: Option<u128>,
    pub color: Option<Color>,
    pub value: Value,
    pub lock_expiry: u128,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AnonymousCard {
    pub id: Option<u128>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum PossiblyAnonHand {
    SendableHand(Vec<SendableCard>),
    AnonymousHand(Vec<AnonymousCard>),
}

impl From<Card> for AnonymousCard {
    fn from(card: Card) -> AnonymousCard {
        return AnonymousCard { id: card.id };
    }
}

pub fn time_to_epoch(time: SystemTime) -> u128 {
    return time
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_millis();
}

impl From<Card> for SendableCard {
    fn from(card: Card) -> SendableCard {
        return SendableCard {
            id: card.id,
            color: card.color,
            value: card.value,
            lock_expiry: time_to_epoch(card.lock_expiry),
        };
    }
}

pub async fn get_sendable_gamestate(gamestate: &Gamestate, user: &User) -> SendableGamestate {
    let winner = match *(gamestate.winner.read().await) {
        None => None,
        Some(x) => Some(x.to_string()),
    };
    let users = gamestate
        .users
        .read()
        .await
        .clone()
        .into_iter()
        .map(|(_, user)| SendableUser::from(user))
        .collect();
    let discard: Vec<SendableCard> = gamestate
        .discard
        .read()
        .await
        .clone()
        .into_iter()
        .map(|card: Card| SendableCard::from(card))
        .collect();
    let room_id = gamestate.room_id.to_string();
    let user_id = user.uuid.to_string();
    let game_started = *gamestate.game_started.read().await;
    let table_pos = user.table_pos;
    let deck: Vec<AnonymousCard> = gamestate
        .deck
        .read()
        .await
        .clone()
        .into_iter()
        .map(|card: Card| AnonymousCard::from(card))
        .collect();

    let hands: HashMap<u128, PossiblyAnonHand> = gamestate
        .hands
        .read()
        .await
        .clone()
        .into_iter()
        .map(|(hand_id, hand)| {
            if hand_id == user.table_pos && game_started {
                return (
                    hand_id,
                    PossiblyAnonHand::SendableHand(
                        hand.into_iter()
                            .map(|card: Card| SendableCard::from(card))
                            .collect(),
                    ),
                );
            } else {
                return (
                    hand_id,
                    PossiblyAnonHand::AnonymousHand(
                        hand.into_iter()
                            .map(|card: Card| AnonymousCard::from(card))
                            .collect(),
                    ),
                );
            }
        })
        .collect();

    let test = (
        SendableCard {
            id: Some(420),
            color: Some(Color::Green),
            value: Value::Seven,
            lock_expiry: 0,
        },
        Color::Blue,
    );

    return SendableGamestate {
        users,
        game_started,
        winner,
        room_id,
        user_id,
        table_pos,
        deck,
        discard,
        hands,
        test,
    };
}
