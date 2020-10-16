import React from "react";

const styles = {
  display: "flex",
  flexDirection: "row-reverse",
  justifyContent: "space-between",
};
const ModalHeaderActionBar = ({
  setContentStateFn,
  modalActionBarTitle,
  modalActionBarButtonIcon,
}) => (
  <div style={{ ...styles }}>
    {modalActionBarTitle ? <h2>{modalActionBarTitle}</h2> : null}
    {
      <button
        onClick={setContentStateFn}
        className="mdc-icon-button material-icons"
      >
        {modalActionBarButtonIcon}
      </button>
    }
  </div>
);


export default ModalHeaderActionBar