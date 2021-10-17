#[derive(Debug)]
pub enum UnoError {
    SerdeError(serde_json::Error),
    ParseError(()),
    InvalidMove(String),
    InvalidState(String),
    InvalidRoom,
    TooManyPlayers,
    GameStartedAlready,
}

impl From<serde_json::Error> for UnoError {
    fn from(err: serde_json::Error) -> UnoError {
        UnoError::SerdeError(err)
    }
}

impl From<()> for UnoError {
    fn from(_: ()) -> UnoError {
        UnoError::ParseError(())
    }
}
