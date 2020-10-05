import PropTypes from "prop-types";
import React from "react";

const cornerPositionLogic = (pos) => {
  switch (pos) {
    case "bottom-right":
      return {
        alignItems: "flex-end",
        justifyContent: "flex-end",
      };
    case "bottom-left":
      return {
        alignItems: "flex-end",
        justifyContent: "flex-start",
      };
    case "top-right":
      return {
        alignItems: "flex-start",
        justifyContent: "flex-end",
      };
    case "top-left":
      return {
        alignItems: "flex-start",
        justifyContent: "flex-start",
      };
    case "center":
      return {
        alignItems: "center",
        justifyContent: "center",
      };
    case "bottom-center":
      return {
        alignItems: "flex-end",
        justifyContent: "center",
      };
    case "top-center":
      return {
        alignItems: "flex-start",
        justifyContent: "center",
      };
    case "left-center":
      return {
        alignItems: "center",
        justifyContent: "flex-start",
      };
    case "right-center":
      return {
        alignItems: "center",
        justifyContent: "flex-end",
      };
    default:
      break;
  }
};

const modalSizeLogic = (size) => {
  switch (size) {
    case "full-screen":
      return {
        width: "calc(100% - 72px)",
        height: "calc(100% - 72px)",
      };
    case "full-height":
      return {
        height: "calc(100% - 72px)",
      };
    case "full-width":
      return {
        width: "calc(100% - 72px)",
      };
    default:
      return "";
  }
};

const baseStyleDefault = {
  modalContainer: {
    width: "100%",
    height: "100%",
    position: "fixed",
    display: "flex",
    zIndex: 7,
    pointerEvents: "none",
  },
  contentContainer: {
    padding: "8px",
    borderRadius: "8px",
    border: "solid #efefef 1px",
    boxShadow:
      "0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)",
    margin: "30px",
    zIndex: "7",
    position: "fixed",
    background: "white",
    pointerEvents: "all",
    maxWidth: "calc(100% - 72px)",
  },
};

const FlexModal = ({
  cornerPosition = "bottom-right",
  contentContainerStyle,
  modalContainerStyle,
  isDisplayed = true,
  modalSize, //Should area be full-screen, full-height, or full-width
  background, //Pass a hex code for overlay area outside of modal content.
  onClickBackground = () => null, //function called on click outside modal content. if set, overrides pointerEvents: 'none' css default
  children,
}) => {
  return isDisplayed ? (
    <div
      style={{
        ...(modalContainerStyle
          ? modalContainerStyle
          : baseStyleDefault.modalContainer),
        ...cornerPositionLogic(cornerPosition),
        ...modalSizeLogic(),
        background: background,
      }}
      onClick={() => onClickBackground()}
    >
      <div
        style={{
          ...(contentContainerStyle
            ? contentContainerStyle
            : baseStyleDefault.contentContainer),
          ...modalSizeLogic(modalSize),
        }}
      >
        {children}
      </div>
    </div>
  ) : null;
};

FlexModal.propTypes = {
  backgroundOverlayColor: PropTypes.string, //pass a hex code or rgb value as a string
  children: PropTypes.element,
  contentContainerStyle: PropTypes.object,
  modalPosition: PropTypes.oneOf([
    "top-right",
    "top-left",
    "top-center",
    "bottom-right",
    "bottom-left",
    "bottom-center",
    "center",
  ]),
  isDisplayed: PropTypes.bool,
  modalContainerStyle: PropTypes.object,
  modalSize: PropTypes.oneOf(["full-screen", "full-height", "full-width"]),
  onClickBackground: PropTypes.func,
};

export default FlexModal;
