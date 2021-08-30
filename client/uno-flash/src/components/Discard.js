import UnoCard from "./Card";

const Discard = ({ cards }) => {
  const topCard = cards[cards.length - 1];
  return (
    <div style={{ position: "relative" }}>
      <UnoCard card={topCard} />
    </div>
  );
};
export default Discard;
