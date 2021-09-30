import React, { useEffect, useState, useCallback } from "react";
import { useSpring, animated } from "react-spring";
import { Lock } from "react-bootstrap-icons";
import { Card } from "react-bootstrap";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
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
  PlusTwo: "+2",
  WildCard: <AccessAlarmIcon />,
};

const UnoCard = ({ card, onClick = () => {} }) => {
  const locked_ms = card.lock_expiry - Date.now();
  const [locked, setLocked] = useState(false);

  const styles = useSpring({
    reset: !locked,
    from: { height: 80 },
    to: { height: 0 },
    config: { duration: locked_ms },
  });

  useEffect(() => {
    if (locked_ms > 0 && locked === false) {
      console.log("locking card " + card.id + " for " + locked_ms);
      setLocked(true);
      setTimeout(() => {
        console.log("unlocking" + card.id);
        setLocked(false);
      }, locked_ms);
    }
  }, [card, locked_ms, locked]);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <Card
        onClick={locked ? () => {} : () => onClick(card.id)}
        style={{
          fontSize: "2rem",
          width: "4rem",
          height: "5rem",
          background: colorMap[card.color] || "grey",
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
      {locked && (
        <animated.div
          style={{
            position: "absolute",
            bottom: 0,
            height: `${locked_ms}px`,
            fontSize: "2rem",
            width: "4rem",
            // height: "5rem",
            backgroundColor: Color("black").fade(0.3),
            borderRadius: "4px",
            ...styles,
          }}
        />
      )}
    </div>
  );
};

export default UnoCard;
