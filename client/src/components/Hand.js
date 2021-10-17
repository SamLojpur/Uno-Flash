import { textAlign } from "@mui/system";
import React from "react";
import UnoCard from "./Card";

const Hand = ({ handId, cards, user, handPos = 0, sendToDiscard }) => {
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
      margin = "4rem";
    }
    if (handPos === 3) {
      isVertical = true;
      textAlign = "right";
      margin = "4rem";
    }
  } else if (handPos === 0) {
    marginBottom = "-2rem";
  } else if (handPos === 2) {
    marginBottom = "5rem";
  }

  // if (!cards || cards.length === 0 || !user) {
  //   return null;
  // }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isVertical ? "center" : "",
        flexDirection: isVertical ? "column" : "row",
        overflowX: isVertical ? "hidden" : "",
        minWidth: "4rem",
        maxWidth: "100%",
        minHeight: "5rem",
        // alignItems: "center",
        overflow: "auto",
      }}
    >
      {cards.map((card) => (
        <UnoCard key={card.id} card={card} onClick={playCard} />
      ))}
      <h3
        style={{
          position: "absolute",
          // transform: "translate(150%,0)",
          left: "0",
          right: "0",
          marginLeft: margin,
          marginRight: margin,
          marginTop: marginBottom,
          textAlign: textAlign,
          // width: "10px",
        }}
        className="text-white"
      >
        {user?.name}
      </h3>
    </div>
  );
};
export default Hand;
