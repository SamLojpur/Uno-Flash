export const curryGetStyle = (parentId) => (style, snapshot) => {
  if (
    !snapshot.isDropAnimating ||
    !snapshot.draggingOver ||
    snapshot.draggingOver === parentId
  ) {
    return style;
  }

  const { moveTo } = snapshot.dropAnimation;

  let translate;
  const parentIsVertical =
    snapshot.draggingOver === "left" || snapshot.draggingOver === "right";

  const parentIsHorizontal =
    snapshot.draggingOver === "top" || snapshot.draggingOver === "bottom";
  if (parentIsVertical) {
    translate = `translate(${moveTo.x}px, ${moveTo.y - 40}px)`;
  } else if (parentIsHorizontal) {
    translate = `translate(${moveTo.x - 32}px, ${moveTo.y}px)`;
  } else {
    translate = `translate(${moveTo.x}px, ${moveTo.y}px)`;
  }

  return {
    ...style,
    transform: `${translate}`,
  };
};
