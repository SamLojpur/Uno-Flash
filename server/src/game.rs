use crate::card::{Card, Color, Value, COLORS, VALUES};
use crate::connections::user_disconnected;
use crate::errors::UnoError;
use crate::gamestate::Gamestate;
use crate::User;
use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, SystemTime};
use tokio::sync::RwLockWriteGuard;
use warp::ws::Message;

#[derive(Serialize, Deserialize, Debug)]
enum Action {
    Draw(usize),
    Play(usize, Option<Color>),
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
        card.id = Some(i);
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
    user: &User,
) -> Result<(), UnoError> {
    if message.is_close() {
        user_disconnected(gamestate, user.uuid).await;
        return Ok(());
    }

    let string_message = message.to_str()?;
    println!("incoming message: {}", string_message);

    let action: Action = serde_json::from_str(string_message)?;
    match action {
        Action::Draw(val) => draw_card_gamestate(gamestate, val, user.table_pos).await?,
        Action::Play(card_id, color) => play_card(gamestate, card_id, &user, color).await?,
    }
    Ok(())
}

async fn draw_card_gamestate(
    gamestate: &Gamestate,
    number: usize,
    hand_pos: usize,
) -> Result<(), UnoError> {
    let mut deck = gamestate.deck.write().await;
    let mut hands = gamestate.hands.write().await;
    let mut discard = gamestate.discard.write().await;

    draw_card(number, hand_pos, &mut deck, &mut hands, &mut discard).await
}

async fn play_card(
    gamestate: &Gamestate,
    card_id: usize,
    user: &User,
    color: Option<Color>,
) -> Result<(), UnoError> {
    let mut write_discard = gamestate.discard.write().await;
    let mut write_hands = gamestate.hands.write().await;
    let mut write_deck = gamestate.deck.write().await;

    let discarded_card = discard_card(
        gamestate,
        user,
        card_id,
        color,
        &mut write_hands,
        &mut write_discard,
    )
    .await?;

    if discarded_card.value == Value::PlusTwo {
        for index in 0..write_hands.clone().len() {
            if index != user.table_pos {
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

    return Ok(());
}

async fn end_game(gamestate: &Gamestate, user: &User) {
    println!("Winner");
    let mut winner = gamestate.winner.write().await;
    *winner = Some(user.uuid);
}

async fn draw_card(
    number: usize,
    hand_pos: usize,
    deck: &mut RwLockWriteGuard<'_, Vec<Card>>,
    hands: &mut RwLockWriteGuard<'_, HashMap<usize, Vec<Card>>>,
    discard: &mut RwLockWriteGuard<'_, Vec<Card>>,
) -> Result<(), UnoError> {
    let mut hand = hands.get(&hand_pos).unwrap().clone();
    for _ in 0..number {
        let mut card = deck.pop().unwrap();
        card.lock_expiry = SystemTime::now() + Duration::from_secs(3);
        hand.push(card);
        println!("{}", deck.len());
        if deck.len() <= 0 {
            deck.append(discard);
            discard.push(deck.pop().unwrap());
            let mut rng = rand::thread_rng();
            deck.shuffle(&mut rng);
        }
    }
    hands.insert(hand_pos, hand);
    Ok(())
}

async fn discard_card(
    gamestate: &Gamestate,
    user: &User,
    card_id: usize,
    color: Option<Color>,
    write_hands: &mut RwLockWriteGuard<'_, HashMap<usize, Vec<Card>>>,
    write_discard: &mut RwLockWriteGuard<'_, Vec<Card>>,
) -> Result<Card, UnoError> {
    let table_pos = user.table_pos;
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
            end_game(gamestate, &user).await;
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
