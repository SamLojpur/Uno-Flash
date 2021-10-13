import { Modal } from "react-bootstrap";
import { useState } from "react";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import _ from "lodash";

const WinnerModal = ({ gamestate, startGame, setName, show, onHide }) => {
  const myUsername = gamestate.users.find(
    ({ uuid }) => uuid === gamestate.room_id
  );
  console.log(gamestate.users);

  const [username, setUsername] = useState(myUsername);

  console.log("p", gamestate);
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header>
        <Modal.Title>Lobby Modal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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

          <Button
            variant="primary"
            style={{ display: "flex" }}
            onClick={startGame}
          >
            Start!
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default WinnerModal;
