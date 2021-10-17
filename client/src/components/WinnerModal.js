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
// name = user.name || `Player ${user.table_pos + 1}`;

export default WinnerModal;
