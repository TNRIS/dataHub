import PropTypes from "prop-types";
import React from "react";

const cornerPositionLogic = (pos) => {
  switch (pos) {
    case "bottom-right":
      return "bottom-right"
    case "bottom-left":
      return "bottom-left"
    case "top-right":
      return "top-right"
    case "top-left":
      return "top-left"
    case "center":
      return "center"
    case "bottom-center":
      return "bottom-center"
    case "top-center":
      return "top-center"
    case "left-center":
      return "left-center"
    case "right-center":
      return "right-center"
    default:
      return "bottom-right"
  }
};

const modalSizeLogic = (size) => {
  switch (size) {
    case "full-screen":
      return "full-screen";
    case "full-height":
      return "full-height";
    case "full-width":
      return "full-width";
    case "half-screen":
      return "half-screen";
    case "half-height":
      return "half-height";
    case "half-width":
      return "half-width";
    default:
      return "";
  }
};

const FlexModal = ({
  modalBackground = "#fff",
  modalTextColor = "#333",
  modalPadding = "0px",
  modalBorder = "none",
  modalPosition = "bottom-right",
  isDisplayed = true,
  modalSize, //Should area be full-screen, full-height, or full-width
  backgroundOverlayColor, //Pass a hex code for overlay area outside of modal content.
  onClickBackground = () => null, //function called on click outside modal content. if set, overrides pointerEvents: 'none' css default
  children,
  modalBackgroundPointerEvents
}) => {
  return isDisplayed ? (
    <div
      style={{
        background: backgroundOverlayColor, pointerEvents: modalBackgroundPointerEvents
      }}
      className={'modalPosition__' + cornerPositionLogic(modalPosition) + ' modalContainer'}
      onClick={() => onClickBackground()}
    >
      <div
        className={'modalSize__' + modalSizeLogic(modalSize) + ' modalContentContainer'}
        style={{
          background: modalBackground,
          color: modalTextColor,
          padding: modalPadding,
          border: modalBorder
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
  modalPosition: PropTypes.oneOf([
    "top-right",
    "top-left",
    "top-center",
    "bottom-right",
    "bottom-left",
    "bottom-center",
    "center-left",
    "center-right",
    "center",
  ]),
  isDisplayed: PropTypes.bool,
  modalSize: PropTypes.oneOf(["full-screen", "full-height", "full-width", "half-width", "half-height", "half-screen", "fit-content"]),
  onClickBackground: PropTypes.func,
};

export default FlexModal;
