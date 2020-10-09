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
      return {
        alignItems: "flex-end",
        justifyContent: "flex-end",
      };
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
    case "half-screen":
      return {
        width: "calc(50% - 72px)",
        height: "calc(50% - 72px)",
      };
    case "half-height":
      return {
        height: "calc(50% - 72px)",
      };
    case "half-width":
      return {
        width: "calc(50% - 72px)",
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
    zIndex: 5001,
    pointerEvents: "none",
  },
  contentContainer: {
    margin: "30px",
    zIndex: "5001",
    position: "fixed",
    pointerEvents: "all",
    maxWidth: "calc(100% - 72px)",
    minWidth: "calc(320px - 72px)",
    boxShadow: '2px 2px 8px #888',
    borderRadius: '4px'
  },
};

const FlexModal = ({
  modalClasses,
  modalBackground = "#fff",
  modalPadding = "0px",
  modalBorder = "none",
  modalPosition = "bottom-right",
  contentContainerStyle,
  modalContainerStyle,
  isDisplayed = true,
  modalSize, //Should area be full-screen, full-height, or full-width
  backgroundOverlayColor, //Pass a hex code for overlay area outside of modal content.
  onClickBackground = () => null, //function called on click outside modal content. if set, overrides pointerEvents: 'none' css default
  children,
}) => {
  return isDisplayed ? (
    <div
      style={{
        ...(modalContainerStyle
          ? modalContainerStyle
          : baseStyleDefault.modalContainer),
        background: backgroundOverlayColor,
        ...cornerPositionLogic(modalPosition),
      }}
      onClick={() => onClickBackground()}
    >
      <div
        className={modalClasses}
        style={{
          ...(contentContainerStyle
            ? contentContainerStyle
            : baseStyleDefault.contentContainer),
          ...modalSizeLogic(modalSize),
          background: modalBackground,
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
  contentContainerStyle: PropTypes.object,
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
  modalContainerStyle: PropTypes.object,
  modalSize: PropTypes.oneOf(["full-screen", "full-height", "full-width", "half-width", "half-height"]),
  onClickBackground: PropTypes.func,
};

export default FlexModal;
