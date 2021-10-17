import React from "react";
import UnoCard from "./Card";

const Hand = ({
  handId,
  cards,
  user,
  handPos = 0,
  sendToDiscard = () => {},
}) => {
  const playCard = (id, options) => {
    sendToDiscard(handId, id, options);
  };

  let isVertical;
  let textAlign = "center";
  let margin = "auto";
  let marginBottom = "auto";
  if (handPos === 1 || handPos === 3) {
    if (handPos === 1) {
      isVertical = true;
      textAlign = "left";
      margin = "5rem";
    }
    if (handPos === 3) {
      isVertical = true;
      textAlign = "right";
      margin = "5rem";
    }
  } else if (handPos === 0) {
    marginBottom = "-2rem";
  } else if (handPos === 2) {
    marginBottom = "6rem";
  }

  let name;
  if (user) {
    name = user.name || `Player ${user.table_pos + 1}`;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isVertical ? "center" : "",
        flexDirection: isVertical ? "column" : "row",
        overflowX: "hidden",
        minWidth: "5rem",
        maxWidth: "100%",
        minHeight: "5rem",
        overflow: "auto",
      }}
    >
      {cards.map((card) => (
        <UnoCard key={card.id} card={card} onClick={playCard} />
      ))}
      <h3
        style={{
          position: "absolute",
          left: "0",
          right: "0",
          marginLeft: margin,
          marginRight: margin,
          marginTop: marginBottom,
          textAlign: textAlign,
          pointerEvents: "none",
        }}
        className="text-white"
      >
        {name}
      </h3>
    </div>
  );
};
export default Hand;
