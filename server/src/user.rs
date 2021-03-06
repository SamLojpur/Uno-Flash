use tokio::sync::mpsc::UnboundedSender;
use warp::ws::Message;

#[derive(Clone, Debug)]
pub struct User {
    pub tx: UnboundedSender<Result<Message, warp::Error>>,
    pub table_pos: u128,
    pub name: Option<String>,
    pub uuid: u128,
}
