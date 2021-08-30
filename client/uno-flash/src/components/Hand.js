import React from "react";
import UnoCard from "./Card";

const Hand = ({ handId, cards, isVertical = false, sendToDiscard }) => {
  const playCard = (id) => {
    sendToDiscard(handId, id);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: isVertical ? "column" : "row",
        alignItems: "center",
      }}
    >
      {cards.map((card, i) => (
        <UnoCard key={card.id} card={card} onClick={playCard} />
      ))}
    </div>
  );
};
export default Hand;
