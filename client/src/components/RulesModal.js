import { Modal } from "react-bootstrap";
import UnoCard from "./Card";

const WinnerModal = ({ show, onHide }) => {
  const skipCard = {
    lock_expiry: Date.now(),
    id: 0,
    value: "Skip",
    color: "Red",
  };

  const plusTwoCard = {
    lock_expiry: Date.now(),
    id: 1,
    value: "PlusTwo",
    color: "Blue",
  };

  const wildCard = {
    lock_expiry: Date.now(),
    id: 1,
    value: "WildCard",
    color: null,
  };

  const wildCardYellow = {
    lock_expiry: Date.now(),
    id: 1,
    value: "WildCard",
    color: "Yellow",
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header>
        <Modal.Title>Rules</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Welcome to Uno Flash! Uno Flash is just like normal Uno with one
          exception: There are no turns. All players play their turn as fast as
          possible, clicking cards that share a color or number with the last
          discarded card. It can get pretty frantic!
        </p>
        <p>
          To get started, enter a name and click 'Create Room'. You can invite
          other players to join your lobby using the link in your lobby. Make
          sure to give everyone a chance to set their own name before you start.
        </p>
        <p>
          After that, it's go time! The goal of the game is to be the first
          player with no cards in hand. Players must click cards in their hand
          that match the color or value of the card in the discard pile.
          Whenever you play a card, your other cards have a brief 'cooldown'
          before they can be played. This cooldown is also applied to recently
          drawn cards. If you get stuck, you can click on the draw pile to draw
          more cards (or wait for someone else to play a different card 😉).
        </p>
        <p>There are a few special cards to be aware of:</p>
        <table>
          {/* <tr>
            <th>Company</th>
            <th>Contact</th>
          </tr> */}
          <tr>
            <td>
              <UnoCard card={skipCard} />
            </td>
            <td
              style={{
                paddingLeft: "1rem",
              }}
            >
              "Block" cards add a cooldown to half of each opponent's cards
            </td>
          </tr>
          <tr>
            <td>
              <UnoCard card={plusTwoCard} />
            </td>
            <td
              style={{
                paddingLeft: "1rem",
              }}
            >
              "+2" cards force each other player to draw 2 additional cards
            </td>
          </tr>
          <tr>
            <td>
              <UnoCard card={wildCard} />
              <UnoCard card={wildCardYellow} />
            </td>
            <td
              style={{
                paddingLeft: "1rem",
              }}
            >
              "Wild" cards can be played at any time. Click on any corner of
              them to set the discard pile to that color
            </td>
          </tr>
        </table>
      </Modal.Body>
    </Modal>
  );
};
// name = user.name || `Player ${user.table_pos + 1}`;

export default WinnerModal;
