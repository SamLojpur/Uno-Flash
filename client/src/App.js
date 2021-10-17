import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import "./App.css";
import Game from "./components/Game";
import Lobby from "./components/Lobby";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const App = () => {
  const [user, setUser] = useState();
  return (
    <div className="App">
      <header className="App-header">
        <div
          style={{
            display: "flex",
            width: "100vw",
            height: "100vh",
          }}
        >
          <Router>
            <Switch>
              <Route path="/room/:room_id?">
                <Game user={user} />
              </Route>
              <Route>
                <Lobby
                  setUser={setUser}
                  // setRoomCode={setRoomCode}
                  // setPlayingGame={setPlayingGame}
                />
              </Route>
            </Switch>
            {/* {playingGame ? (
            <Game roomCode={roomCode} />
          ) : (
            <Lobby setRoomCode={setRoomCode} setPlayingGame={setPlayingGame} />
          )} */}
          </Router>
        </div>
      </header>
    </div>
  );
};

export default App;
