import React from "react";

const ModalHeaderActionBar = ({
  setContentStateFn,
  modalActionBarTitle,
  modalActionBarButtonIcon,
}) => (
  <div className="mdc-top-app-bar__row">
    <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
      {modalActionBarTitle ? (
        <h2 className="mdc-typography--headline5">{modalActionBarTitle}</h2>
      ) : null}{" "}
    </section>
    <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end">
      {
        <button
          onClick={setContentStateFn}
          className="mdc-icon-button material-icons"
        >
          {modalActionBarButtonIcon}
        </button>
      }
    </section>
  </div>
);

export default ModalHeaderActionBar;
