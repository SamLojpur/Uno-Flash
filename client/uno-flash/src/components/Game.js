import Hand from "./Hand";
import { useEffect, useState } from "react";
import Discard from "./Discard";
import Deck from "./Deck";
import Cookies from "js-cookie";
import { useHistory, useParams } from "react-router-dom";
import WinnerModal from "./WinnerModal";

const array_remove_by_id = (array, id) => {
  const from = get_index_from_id(array, id);
  const value = array[from];
  const removeFront = array.slice(0, from);
  const removeBack = array.slice(from + 1);
  return [value, [...removeFront, ...removeBack]];
};

const get_index_from_id = (array, id) => {
  return array.findIndex((card) => card.id === id);
};

const Game = ({ user }) => {
  let url_params = useParams();
  let history = useHistory();
  const [webSocket, setWebSocket] = useState();
  const [gamestate, setGamestate] = useState({
    winner: null,
    user_id: null,
    room_id: null,
    table_pos: null,
    discard: null,
    deck: null,
    hands: {},
  });

  useEffect(() => {
    let webSocket;
    if (process.env.NODE_ENV === "development") {
      console.log("connecting to development server");
      webSocket = new WebSocket("ws://127.0.0.1:3030/ws/");
    } else {
      console.log("connecting to production server");
      webSocket = new WebSocket("wss://uno-flash.herokuapp.com/ws/");
    }

    webSocket.onopen = (event) => {
      let user_id = null;
      let room_id = null;
      if (Cookies.get("user_id") !== undefined) {
        user_id = Cookies.get("user_id");
      }
      console.log(url_params.room_id);
      if (url_params.room_id !== "unknown") {
        room_id = url_params.room_id;
      }

      let introduction = { user_id, room_id, name: user?.name };
      webSocket.send(JSON.stringify(introduction));
    };

    webSocket.onmessage = function (event) {
      const gamestate = JSON.parse(event.data);
      console.log(gamestate);
      Cookies.set("user_id", gamestate.user_id);

      if (!url_params.room_id || url_params.room_id === "unknown") {
        history.replace(gamestate.room_id);
      }
      setGamestate(gamestate);
    };
    setWebSocket(webSocket);
  }, []);

  const sendToDiscard = (source, id) => {
    const [val, newHand] = array_remove_by_id(gamestate.hands[source], id);
    webSocket.send(JSON.stringify({ Play: id }));
    setGamestate({
      ...gamestate,
      hands: {
        [source]: newHand,
      },
      discard: [val, ...gamestate.discard],
    });
  };

  const drawCard = () => {
    webSocket.send(JSON.stringify({ Draw: 1 }));
  };

  if (gamestate.user_id === null) {
    return null;
  }

  let winnerText;
  if (gamestate.winner) {
    if (gamestate.winner === gamestate.user_id) {
      winnerText = "You win!";
    } else {
      let winner =
        gamestate.users.find((user) => gamestate.winner === user.uuid)?.name ||
        "User " + gamestate.winner;
      winnerText = winner + " wins!";
    }
  }

  return (
    <>
      <WinnerModal
        show={!!gamestate.winner}
        winnerText={winnerText}
        onHide={() => history.replace("/")}
      />
      <Hand
        handId="left"
        cards={gamestate.hands[(gamestate.table_pos + 1) % 4] || []}
        isVertical={true}
        sendToDiscard={sendToDiscard}
      />
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",

          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Hand
          handId="top"
          cards={gamestate.hands[(gamestate.table_pos + 2) % 4] || []}
          sendToDiscard={sendToDiscard}
        />
        <div
          style={{
            display: "flex",
            flexGrow: 1,

            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Discard cards={gamestate.discard} />
          <Deck cards={gamestate.deck} drawCard={drawCard} />
        </div>
        <Hand
          handId={gamestate.table_pos}
          cards={gamestate.hands[gamestate.table_pos] || []}
          sendToDiscard={sendToDiscard}
        />
      </div>
      <Hand
        handId={(gamestate.table_pos + 3) % 4}
        cards={gamestate.hands[(gamestate.table_pos + 3) % 4] || []}
        isVertical={true}
        sendToDiscard={sendToDiscard}
      />
    </>
  );
};

export default Game;
