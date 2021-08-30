import React, { useEffect, useState } from "react";
import { Lock } from "react-bootstrap-icons";

import { Card } from "react-bootstrap";
import Color from "color";

const colorMap = {
  Red: "#D72600",
  Blue: "#0956BF",
  Green: "#379711",
  Yellow: "#ECD407",
};

const numberMap = {
  One: "1",
  Two: "2",
  Three: "3",
  Four: "4",
  Five: "5",
  Six: "6",
  Seven: "7",
  Eight: "8",
  Nine: "9",
  Ten: "10",
};

const UnoCard = ({ card, onClick = () => {} }) => {
  console.log(card);
  console.log(card.lock_expiry - Date.now());
  const locked_ms = card.lock_expiry - Date.now();
  const [locked, setLocked] = useState(locked_ms > 0);

  useEffect(() => {
    if (locked_ms > 0) {
      setLocked(true);
      setTimeout(() => {
        console.log("unlocking" + card.id);
        setLocked(false);
      }, 1000);
    }
  }, [card, locked_ms]);

  return (
    <div>
      <Card
        onClick={locked ? () => {} : () => onClick(card.id)}
        style={{
          fontSize: "2rem",
          width: "4rem",
          height: "5rem",
          background: Color(colorMap[card.color] || "grey")
            .desaturate(locked ? 0.5 : 0)
            .hex(),
        }}
      >
        <div
          style={{
            marginTop: "1rem",
          }}
        >
          {card.color && card.value ? numberMap[card.value] : "?"}
        </div>
        <Lock
          size={locked ? 60 : 0}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </Card>
    </div>
  );
};

export default UnoCard;
