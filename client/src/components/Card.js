import React, { useEffect, useState, useCallback } from "react";
import { useSpring, animated } from "react-spring";
// TODO stop using 2 icon libs
import { Lock } from "react-bootstrap-icons";
import { Card } from "react-bootstrap";
import BlockIcon from "@mui/icons-material/Block";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
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
  WildCard: (
    <AllInclusiveIcon
      style={{ transform: "translate(0%, -10%)" }}
      sx={{ fontSize: 32 }}
    />
  ),
  Skip: (
    <BlockIcon
      style={{ transform: "translate(0%, -10%)" }}
      sx={{ fontSize: 32 }}
    />
  ),
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

  const isWild = card.value && !card.color;

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <Card
        onClick={locked || isWild ? () => {} : () => onClick(card.id)}
        style={{
          fontSize: "2rem",
          width: "4rem",
          height: "5rem",
          background: colorMap[card.color] || "grey",
        }}
      >
        {isWild && (
          <div>
            <div
              onClick={
                locked ? () => {} : () => onClick(card.id, { color: "Red" })
              }
              style={{
                position: "absolute",
                height: "2.5rem",
                width: "2rem",
                top: "-1px",
                left: "-1px",
                borderRadius: "4px 0 0 0",
                backgroundColor: colorMap.Red,
              }}
            />
            <div
              onClick={
                locked ? () => {} : () => onClick(card.id, { color: "Blue" })
              }
              style={{
                position: "absolute",
                height: "2.5rem",
                width: "2rem",
                top: "-1px",
                right: "-1px",
                borderRadius: "0 4px 0 0",
                backgroundColor: colorMap.Blue,
              }}
            />
            <div
              onClick={
                locked ? () => {} : () => onClick(card.id, { color: "Yellow" })
              }
              style={{
                position: "absolute",
                height: "2.5rem",
                width: "2rem",
                bottom: "-1px",
                left: "-1px",
                borderRadius: "0 0 0 4px",
                backgroundColor: colorMap.Yellow,
              }}
            />
            <div
              onClick={
                locked ? () => {} : () => onClick(card.id, { color: "Green" })
              }
              style={{
                position: "absolute",
                height: "2.5rem",
                width: "2rem",
                bottom: "-1px",
                right: "-1px",
                borderRadius: "0 0 4px 0",
                backgroundColor: colorMap.Green,
              }}
            />
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: isWild ? "white" : "black",
            pointerEvents: "none",
          }}
        >
          {card.value ? numberMap[card.value] : ""}
        </div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Lock size={locked ? 60 : 0} />
        </div>
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
