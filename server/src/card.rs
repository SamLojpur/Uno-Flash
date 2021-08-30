use serde::{Deserialize, Serialize};
use std::time::SystemTime;

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub enum Color {
    Red,
    Blue,
    Yellow,
    Green,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub enum Value {
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
}

pub static COLORS: [Color; 4] = [Color::Red, Color::Blue, Color::Yellow, Color::Green];
pub static VALUES: [Value; 10] = [
    Value::One,
    Value::Two,
    Value::Three,
    Value::Four,
    Value::Five,
    Value::Six,
    Value::Seven,
    Value::Eight,
    Value::Nine,
    Value::Ten,
];

#[derive(Debug, Clone)]
pub struct Card {
    pub id: Option<usize>,
    pub color: Color,
    pub value: Value,
    pub lock_expiry: SystemTime,
}
