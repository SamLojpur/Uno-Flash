import { Modal, Button } from "react-bootstrap";

const WinnerModal = ({ winnerText, users, user_id, show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Game over!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>{winnerText}</div>

        <Button
          variant="primary"
          style={{ marginTop: "1rem" }}
          onClick={onHide}
        >
          New Game
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default WinnerModal;
