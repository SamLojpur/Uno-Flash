use crate::card;
use crate::game;
use crate::user;

use card::Card;
use game::generate_deck;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use user::User;
use uuid::Uuid;

pub type UsersMutex = Arc<RwLock<HashMap<u128, User>>>;
pub type DiscardMutex = Arc<RwLock<Vec<Card>>>;
pub type DeckMutex = Arc<RwLock<Vec<Card>>>;
pub type HandsMutex = Arc<RwLock<HashMap<usize, Vec<Card>>>>;
pub type GameStatesMutex = Arc<RwLock<HashMap<u128, Gamestate>>>;

#[derive(Clone)]
pub struct Gamestate {
    pub room_id: u128,
    pub winner: Arc<RwLock<Option<u128>>>,
    pub users: UsersMutex,
    pub discard: DiscardMutex,
    pub deck: DeckMutex,
    pub hands: HandsMutex,
}

pub fn new_game() -> Gamestate {
    let room_id = Uuid::new_v4().as_u128();
    let (deck, discard) = generate_deck();
    Gamestate {
        room_id,
        winner: Arc::new(RwLock::new(None)),
        users: Arc::new(RwLock::new(HashMap::new())),
        deck: Arc::new(RwLock::new(deck)),
        hands: Arc::new(RwLock::new(HashMap::new())),
        discard: Arc::new(RwLock::new(discard)),
    }
}
