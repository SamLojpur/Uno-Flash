import {} from "bootstrap";
import { useState } from "react";
import { Card, Button, InputGroup, FormControl } from "react-bootstrap";
import { useHistory } from "react-router";
import HelpButton from "./HelpButton";
import RulesModal from "./RulesModal";

const Lobby = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [roomcode, setRoomcode] = useState("");
  let history = useHistory();

  const [showRules, setShowRules] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <RulesModal show={showRules} onHide={() => setShowRules(false)} />

      <div
        style={{
          flexGrow: 1,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Card style={{ width: "25rem", padding: "1rem" }}>
          <Card.Title style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div>Uno Flash</div>
              <HelpButton onClick={() => setShowRules(true)} />
            </div>
          </Card.Title>{" "}
          <Card.Body>
            <label>Username</label>

            <input
              id="username"
              className="form-control"
              type="text"
              placeholder="Xx_Haxorman420_xX"
              label={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
          </Card.Body>
          <Card.Body>
            <Button
              variant="primary"
              style={{ marginBottom: "1rem" }}
              onClick={() => {
                setUser({ name: username });
                history.push("/room/");
              }}
            >
              Create Room
            </Button>

            <InputGroup>
              <FormControl
                value={roomcode}
                onChange={(e) => {
                  setRoomcode(e.target.value);
                }}
                placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                aria-label="Room Code"
                aria-describedby="basic-addon2"
              />
              <InputGroup.Append>
                <Button
                  variant="primary"
                  onClick={() => {
                    setUser({ name: username });
                    history.push("/room/" + roomcode);
                  }}
                >
                  Join Room
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </Card.Body>
        </Card>
      </div>
      <div
        style={{
          flexGrow: 1,
        }}
      />
    </div>
  );
};
export default Lobby;
