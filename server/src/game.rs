use crate::card::{Card, Color, Value, COLORS, VALUES};
use crate::connections::deal_hand;
use crate::connections::user_disconnected;
use crate::errors::UnoError;
use crate::gamestate::reset_gamestate;
use crate::gamestate::Gamestate;
use crate::lobby::parse_lobby_string_to_action;
use crate::User;
use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::convert::TryInto;
use std::time::{Duration, SystemTime};
use tokio::sync::RwLockWriteGuard;
use warp::ws::Message;

#[derive(Serialize, Deserialize, Debug)]
pub enum Action {
    Draw(u128),
    Play(u128, Option<Color>),
    Reset(),
}

pub fn generate_deck() -> (Vec<Card>, Vec<Card>) {
    let mut deck = Vec::new();
    for color in &COLORS {
        for value in &VALUES {
            let card;
            if value == &Value::WildCard {
                card = Card {
                    color: None,
                    value: value.clone(),
                    id: None,
                    lock_expiry: SystemTime::now(),
                };
            } else {
                card = Card {
                    color: Some(color.clone()),
                    value: value.clone(),
                    id: None,
                    lock_expiry: SystemTime::now(),
                };
            }
            deck.push(card);
        }
    }
    let mut rng = rand::thread_rng();
    deck.shuffle(&mut rng);
    for (i, card) in deck.iter_mut().enumerate() {
        card.id = Some(i.try_into().unwrap());
    }

    COLORS.choose(&mut rng);

    let mut discard = Vec::new();
    let mut first_card = deck.pop().unwrap();
    if first_card.value == Value::WildCard {
        first_card.color = Some(COLORS.choose(&mut rng).unwrap().clone());
    }
    discard.push(first_card);
    return (deck, discard);
}

pub async fn parse_message_to_action(
    gamestate: &Gamestate,
    message: Message,
    user_id: &u128,
) -> Result<(), UnoError> {
    if message.is_close() {
        user_disconnected(gamestate, user_id).await;
        return Ok(());
    }

    let string_message = message.to_str()?;
    println!("incoming message: {}", string_message);

    if *gamestate.game_started.read().await {
        parse_game_string_to_action(&gamestate, &user_id, &string_message).await?;
    } else {
        parse_lobby_string_to_action(&gamestate, &user_id, &string_message).await?;
    }
    Ok(())
}

pub async fn parse_game_string_to_action(
    gamestate: &Gamestate,
    user_id: &u128,
    string_message: &str,
) -> Result<(), UnoError> {
    let action: Action = serde_json::from_str(string_message)?;

    match action {
        Action::Draw(val) => draw_card_gamestate(gamestate, user_id, val).await?,
        Action::Play(card_id, color) => play_card(gamestate, user_id, card_id, color).await?,
        Action::Reset() => reset_game(gamestate).await?,
    }
    Ok(())
}

async fn reset_game(gamestate: &Gamestate) -> Result<(), UnoError> {
    reset_gamestate(gamestate).await;
    let users = gamestate.users.write().await.clone();
    for (_uid, user) in users {
        deal_hand(&gamestate, &user).await;
    }

    Ok(())
}

async fn get_table_pos(
    users: &tokio::sync::RwLockReadGuard<'_, std::collections::HashMap<u128, User>>,
    user_id: &u128,
) -> Result<u128, UnoError> {
    let table_pos = users
        .iter()
        .find_map(|(&uuid, user)| if &uuid == user_id { Some(user) } else { None })
        .unwrap()
        .table_pos;
    return Ok(table_pos);
}

async fn draw_card_gamestate(
    gamestate: &Gamestate,
    user_id: &u128,
    number: u128,
) -> Result<(), UnoError> {
    let users = gamestate.users.read().await;
    let mut deck = gamestate.deck.write().await;
    let mut hands = gamestate.hands.write().await;
    let mut discard = gamestate.discard.write().await;

    let table_pos = get_table_pos(&users, user_id).await?;
    draw_card(number, table_pos, &mut deck, &mut hands, &mut discard).await
}

async fn play_card(
    gamestate: &Gamestate,
    user_id: &u128,
    card_id: u128,
    color: Option<Color>,
) -> Result<(), UnoError> {
    let users = gamestate.users.read().await;
    let mut write_discard = gamestate.discard.write().await;
    let mut write_hands = gamestate.hands.write().await;
    let mut write_deck = gamestate.deck.write().await;

    let table_pos = get_table_pos(&users, user_id).await?;

    let discarded_card = discard_card(
        gamestate,
        user_id,
        card_id,
        table_pos,
        color,
        &mut write_hands,
        &mut write_discard,
    )
    .await?;

    if discarded_card.value == Value::PlusTwo {
        for index in 0..write_hands.clone().len().try_into().unwrap() {
            if index != table_pos {
                draw_card(
                    2,
                    index,
                    &mut write_deck,
                    &mut write_hands,
                    &mut write_discard,
                )
                .await
                .expect("Plus two draw could not occur");
            }
        }
    }

    if discarded_card.value == Value::Skip {
        for index in 0..write_hands.len().try_into().unwrap() {
            if index != table_pos {
                let mut hand = write_hands[&index].clone();
                let hand_length = hand.len();

                hand = hand
                    .into_iter()
                    .enumerate()
                    .map(|(i, card)| {
                        let mut my_card = card.clone();

                        if i * 2 < hand_length {
                            if my_card.lock_expiry < SystemTime::now() + Duration::from_millis(1500)
                            {
                                my_card.lock_expiry =
                                    SystemTime::now() + Duration::from_millis(1500);
                            }
                        }

                        return my_card;
                    })
                    .collect();

                (*write_hands).insert(index, hand.clone());
            }
        }
    }

    return Ok(());
}

async fn end_game(gamestate: &Gamestate, user_id: &u128) {
    println!("Winner");
    let mut winner = gamestate.winner.write().await;
    *winner = Some(*user_id);
}

async fn draw_card(
    number: u128,
    hand_pos: u128,
    deck: &mut RwLockWriteGuard<'_, Vec<Card>>,
    hands: &mut RwLockWriteGuard<'_, HashMap<u128, Vec<Card>>>,
    discard: &mut RwLockWriteGuard<'_, Vec<Card>>,
) -> Result<(), UnoError> {
    let mut hand = hands.get(&hand_pos).unwrap().clone();
    for _ in 0..number {
        let mut card_option = deck.pop();
        if card_option.is_none() {
            // if deck.len() <= 0 {
            deck.append(discard);
            discard.push(deck.pop().unwrap());
            let mut rng = rand::thread_rng();
            deck.shuffle(&mut rng);
            // }
            if deck.len() <= 0 {
                return Ok(());
            } else {
                card_option = deck.pop();
            }
        }
        let mut card = card_option.unwrap();
        card.lock_expiry = SystemTime::now() + Duration::from_secs(3);
        hand.push(card);
    }
    hands.insert(hand_pos, hand);
    Ok(())
}

async fn discard_card(
    gamestate: &Gamestate,
    user_id: &u128,
    card_id: u128,
    table_pos: u128,
    color: Option<Color>,
    write_hands: &mut RwLockWriteGuard<'_, HashMap<u128, Vec<Card>>>,
    write_discard: &mut RwLockWriteGuard<'_, Vec<Card>>,
) -> Result<Card, UnoError> {
    let mut hand = write_hands[&table_pos].clone();

    let played_card_index = write_hands[&table_pos]
        .clone()
        .into_iter()
        .position(|card| card.id.unwrap() == card_id)
        .ok_or(UnoError::InvalidState(
            "Card not found in user's hand".to_string(),
        ))?;
    let card = hand.get(played_card_index).unwrap().clone();

    if write_discard.last().expect("Discard empty").color == card.color
        || write_discard.last().expect("Discard empty").value == card.value
        || card.value == Value::WildCard
    {
        let mut card = hand.remove(played_card_index);
        if card.value == Value::WildCard {
            card.color = color;
        }
        if hand.len() == 0 {
            end_game(gamestate, user_id).await;
        }

        hand = hand
            .into_iter()
            .map(|card| {
                let mut my_card = card.clone();
                if my_card.lock_expiry < SystemTime::now() + Duration::from_millis(500) {
                    my_card.lock_expiry = SystemTime::now() + Duration::from_millis(500);
                }
                return my_card;
            })
            .collect();

        (*write_discard).push(card.clone());
        (*write_hands).insert(table_pos, hand.clone());
    } else {
        return Err(UnoError::InvalidMove(format!(
            "User tried to play {:#?} on a {:#?}",
            card, write_discard
        )));
    }

    Ok(card.clone())
}
