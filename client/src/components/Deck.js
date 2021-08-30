import UnoCard from "./Card";

const Deck = ({ cards, drawCard }) => {
  const topCard = cards[0];
  return (
    <div style={{ position: "relative" }}>
      <UnoCard card={topCard} onClick={drawCard} />
    </div>
  );
};
export default Deck;
