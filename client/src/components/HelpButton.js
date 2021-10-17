import { QuestionCircle } from "react-bootstrap-icons";
import { Button } from "react-bootstrap";

const HelpButton = ({ onClick, isModal = false }) => {
  console.log();
  return (
    <Button
      variant="link"
      class=""
      style={{
        borderRadius: "24px",
        padding: "2px",
        height: isModal ? "30px" : "",
      }}
      onClick={onClick}
    >
      <QuestionCircle
        style={{
          width: "24px",
          height: "24px",
        }}
      />
    </Button>
  );
};
export default HelpButton;
