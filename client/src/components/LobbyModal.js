import { Modal } from "react-bootstrap";
import { useState } from "react";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import _ from "lodash";
import { Link45deg } from "react-bootstrap-icons";
import HelpButton from "./HelpButton";

const LobbyModal = ({
  gamestate,
  startGame,
  setName,
  show,
  onHide,
  onHelp,
}) => {
  const myUsername = gamestate.users.find(
    ({ uuid }) => uuid === gamestate.room_id
  );

  const [username, setUsername] = useState(myUsername);
  const [linkCopied, setLinkCopied] = useState(false);
  return (
    <Modal show={show} onHide={onHide} onHelp={onHelp} centered>
      <Modal.Header>
        <Modal.Title style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div>Players</div>
            <HelpButton onClick={onHelp} isModal={true} />
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
            padding: 0,
            marginBottom: "1rem",
          }}
          variant="link"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setLinkCopied(true);
          }}
        >
          {linkCopied ? (
            <>
              <Link45deg
                style={{
                  marginRight: "0.2rem",
                }}
              />
              Copied!
            </>
          ) : (
            <>
              <Link45deg
                style={{
                  marginRight: "0.2rem",
                }}
              />
              {window.location.href}
            </>
          )}
        </Button>
        <form>
          <div className="form-group row">
            {_.sortBy(gamestate.users, "table_pos").map((x, i) => {
              return (
                <div key={x.uuid} style={{ display: "contents" }}>
                  <label className="col-sm-1 col-form-label">{i + 1}.</label>
                  <div className="col-sm-11">
                    {x.uuid === gamestate.user_id && !x.name ? (
                      <InputGroup>
                        <FormControl
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                          }}
                          placeholder="Add a username!"
                          aria-label="Username"
                          aria-describedby="basic-addon2"
                        />
                        <InputGroup.Append>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setName(username);
                            }}
                          >
                            Set Name
                          </Button>
                        </InputGroup.Append>
                      </InputGroup>
                    ) : (
                      <FormControl
                        value={x.name || "Player " + (x.table_pos + 1)}
                        readOnly
                        plaintext
                        placeholder="Add a username!"
                        aria-label="Username"
                        aria-describedby="basic-addon2"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {gamestate.table_pos ? (
            <Button
              variant="grey"
              style={{ display: "flex" }}
              onClick={startGame}
              disabled="true"
            >
              Waiting for host to start game...
            </Button>
          ) : (
            <Button
              variant="primary"
              style={{ display: "flex" }}
              onClick={startGame}
            >
              Start game!
            </Button>
          )}
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default LobbyModal;
