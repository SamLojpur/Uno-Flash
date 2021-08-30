import { Modal } from "react-bootstrap";

const WinnerModal = ({ winnerText, users, user_id, show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header>
        <Modal.Title>Game over!</Modal.Title>
      </Modal.Header>
      <Modal.Body>{winnerText}</Modal.Body>
    </Modal>
  );
};

export default WinnerModal;
