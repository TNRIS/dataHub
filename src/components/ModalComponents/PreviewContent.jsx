import React, { useState } from "react";

const PreviewContent = (props) => {
  const [dontAsk, setDontAsk] = useState(false);

  return (
    <React.Fragment>
      <div>
        {props.preview_header ? <h2 className={'catalog-card__headline mdc-typography--headline6'}>{props.preview_header}</h2> : null}
        {props.preview_body_text ? <p>{props.preview_body_text}</p> : null}
      </div>
      <div className="mdc-form-field">
        <div className="mdc-checkbox mdc-checkbox--touch">
          <input
            checked={dontAsk}
            onChange={() => setDontAsk((dontAsk) => !dontAsk)}
            type="checkbox"
            className="mdc-checkbox__native-control"
            id="checkbox-1"
          />
          <div className="mdc-checkbox__background">
            <svg className="mdc-checkbox__checkmark" viewBox="0 0 24 24">
              <path
                className="mdc-checkbox__checkmark-path"
                fill="none"
                d="M1.73,12.91 8.1,19.28 22.79,4.59"
              />
            </svg>
            <div className="mdc-checkbox__mixedmark"></div>
          </div>
          <div className="mdc-checkbox__ripple"></div>
        </div>
        <label htmlFor="checkbox-1">Do not ask me again</label>
      </div>
      <div
        style={{
          ...props.preview_buttons_container_style,
          display: "grid",
          gap: "8px",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        }}
      >
        <button
          className={"mdc-button mdc-button--outlined"}
          aria-label={props.preview_accept_button_text}
          onClick={() => {
            props.setContentStateFn("full");
            props.localStoreController.setModalKeyStorage(
              props.survey_template_id,
              "STARTED_AT",
              Date.now()
            );
          }}
        >
          {props.preview_accept_button_text}
        </button>
        <button
          className={"mdc-button mdc-button--outlined"}
          aria-label={props.preview_reject_button_text}
          onClick={
            dontAsk
              ? () => {
                  props.setContentStateFn("none");
                  props.localStoreController.setModalKeyStorage(
                    props.survey_template_id,
                    "DO_NOT_DISTURB",
                    "true"
                  );
                }
              : () => props.setContentStateFn("minimized")
          }
        >
          {dontAsk
            ? props.preview_reject_button_text
            : props.preview_later_button_text}
        </button>
      </div>
    </React.Fragment>
  );
};

export default PreviewContent;
