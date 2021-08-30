use crate::card::{Card, COLORS, VALUES};
use crate::connections::user_disconnected;
use crate::errors::UnoError;
use crate::gamestate::Gamestate;
use crate::User;
use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime};
use warp::ws::Message;

#[derive(Serialize, Deserialize, Debug)]
enum Action {
    Draw(usize),
    Play(usize),
}

pub fn generate_deck() -> (Vec<Card>, Vec<Card>) {
    let mut deck = Vec::new();
    for color in &COLORS {
        for value in &VALUES {
            let card = Card {
                color: color.clone(),
                value: value.clone(),
                id: None,
                lock_expiry: SystemTime::now(),
            };
            deck.push(card);
        }
    }
    let mut rng = rand::thread_rng();
    deck.shuffle(&mut rng);
    for (i, card) in deck.iter_mut().enumerate() {
        card.id = Some(i);
    }

    let mut discard = Vec::new();
    discard.push(deck.pop().unwrap());
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
        Action::Draw(val) => draw_card(gamestate, val, user.table_pos).await?,
        Action::Play(card_id) => play_card(gamestate, card_id, &user).await?,
    }
    Ok(())
}

async fn play_card(gamestate: &Gamestate, card_id: usize, user: &User) -> Result<(), UnoError> {
    let mut write_discard = gamestate.discard.write().await;
    let mut write_hands = gamestate.hands.write().await;

    let table_pos = user.table_pos;
    let played_card_index = write_hands[&table_pos]
        .clone()
        .into_iter()
        .position(|card| card.id.unwrap() == card_id)
        .ok_or(UnoError::InvalidState(
            "Card not found in user's hand".to_string(),
        ))?;

    let mut hand = write_hands[&table_pos].clone();
    let card = hand.get(played_card_index).unwrap();

    if write_discard.last().expect("Discard empty").color == card.color
        || write_discard.last().expect("Discard empty").value == card.value
    {
        let card = hand.remove(played_card_index);
        if hand.len() == 0 {
            end_game(gamestate, &user).await;
        }
        let hand_delayed = hand
            .into_iter()
            .map(|card| {
                let mut my_card = card.clone();
                my_card.lock_expiry = SystemTime::now() + Duration::from_secs(1);
                return my_card;
            })
            .collect();

        (*write_discard).push(card);
        (*write_hands).insert(table_pos, hand_delayed);
        return Ok(());
    } else {
        return Err(UnoError::InvalidMove(format!(
            "User tried to play {:#?} on a {:#?}",
            card, write_discard
        )));
    }
}

async fn end_game(gamestate: &Gamestate, user: &User) {
    println!("Winner");
    let mut winner = gamestate.winner.write().await;
    *winner = Some(user.uuid);
}

async fn draw_card(gamestate: &Gamestate, number: usize, hand_pos: usize) -> Result<(), UnoError> {
    let mut deck = gamestate.deck.write().await;
    let mut hands = gamestate.hands.write().await;
    let mut hand = hands.get(&hand_pos).unwrap().clone();
    for _ in 0..number {
        let mut card = deck.pop().unwrap();
        card.lock_expiry = SystemTime::now() + Duration::from_secs(3);
        hand.push(card);
        println!("{}", deck.len());
        if deck.len() <= 0 {
            let mut discard = gamestate.discard.write().await;
            deck.append(&mut discard);
            discard.push(deck.pop().unwrap());
            let mut rng = rand::thread_rng();
            deck.shuffle(&mut rng);
        }
    }
    hands.insert(hand_pos, hand);
    Ok(())
}
