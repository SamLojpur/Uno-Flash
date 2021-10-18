import Hand from "./Hand";
import { useEffect, useState } from "react";
import Discard from "./Discard";
import Deck from "./Deck";
import Cookies from "js-cookie";
import { useHistory, useParams } from "react-router-dom";

import WinnerModal from "./WinnerModal";
import LobbyModal from "./LobbyModal";
import RulesModal from "./RulesModal";

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
  const [showRules, setShowRules] = useState(false);

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
      Cookies.set("user_id", gamestate.user_id);

      if (!url_params.room_id || url_params.room_id === "unknown") {
        history.replace(gamestate.room_id);
      }
      setGamestate(gamestate);
      console.log(gamestate);
    };
    setWebSocket(webSocket);
  }, []);

  const sendToDiscard = (source, id, options) => {
    const [val, newHand] = array_remove_by_id(gamestate.hands[source], id);
    webSocket.send(JSON.stringify({ Play: [id, options?.color] }));
    setGamestate({
      ...gamestate,
      hands: {
        [source]: newHand,
      },
      discard: [val, ...gamestate.discard],
    });
  };

  const startGame = () => {
    webSocket.send(JSON.stringify({ StartGame: [] }));
  };

  const resetGame = () => {
    webSocket.send(JSON.stringify({ Reset: [] }));
  };

  const setName = (name) => {
    webSocket.send(JSON.stringify({ SetName: name }));
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
      let user = gamestate.users.find((user) => gamestate.winner === user.uuid);
      let winner = user?.name || `Player ${user.table_pos + 1}`;
      winnerText = winner + " wins!";
    }
  }
  console.log(gamestate);
  console.log(
    "q",
    gamestate.users.find((user) => user.table_pos === 0)
  );

  return (
    <>
      {!gamestate.game_started && (
        <LobbyModal
          gamestate={gamestate}
          startGame={startGame}
          setName={setName}
          show={true}
          onHide={() => {}}
          onHelp={() => {
            setShowRules(true);
          }}
        />
      )}

      <WinnerModal
        show={!!gamestate.winner}
        winnerText={winnerText}
        onHide={resetGame}
      />

      <RulesModal show={showRules} onHide={() => setShowRules(false)} />

      <div style={{ display: "flex", width: "100vw" }}>
        <Hand
          handId="left"
          cards={gamestate.hands[(gamestate.table_pos + 1) % 4] || []}
          user={gamestate.users.find(
            (user) => user.table_pos === (gamestate.table_pos + 1) % 4
          )}
          handPos={1}
          style={{
            flexShrink: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            flexGrow: 1,
            flexShrink: 1,
            flexDirection: "column",
            maxWidth: "calc(100vw - 10rem)",

            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Hand
            handId="top"
            cards={gamestate.hands[(gamestate.table_pos + 2) % 4] || []}
            user={gamestate.users.find(
              (user) => user.table_pos === (gamestate.table_pos + 2) % 4
            )}
            handPos={2}
            style={{
              flexShrink: 0,
            }}
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
            user={gamestate.users.find(
              (user) => user.table_pos === gamestate.table_pos
            )}
            handPos={0}
            sendToDiscard={sendToDiscard}
          />
        </div>
        <Hand
          handId={(gamestate.table_pos + 3) % 4}
          cards={gamestate.hands[(gamestate.table_pos + 3) % 4] || []}
          user={gamestate.users.find(
            (user) => user.table_pos === (gamestate.table_pos + 3) % 4
          )}
          handPos={3}
        />
      </div>
    </>
  );
};

export default Game;
