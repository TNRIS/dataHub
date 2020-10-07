import React from 'react'

const PreviewContent = (props) => {
    return (
      <React.Fragment>
        <div /* style={{ ...preview_content_style }} */>
          {props.preview_header ? <h2>{props.preview_header}</h2> : null}
          {props.preview_body_text ? <p>{props.preview_body_text}</p> : null}
        </div>
        <div style={{ ...props.preview_buttons_container_style, display: 'grid', gap: '8px' }}>
          <button
            className={"mdc-button mdc-button--raised"}
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
            className={"mdc-button mdc-button--raised"}
            aria-label={props.preview_later_button_text}
            onClick={() => props.setContentStateFn("minimized")}
          >
            {props.preview_later_button_text}
          </button>
          <button
            className={"mdc-button mdc-button--raised"}
            aria-label={props.preview_reject_button_text}
            onClick={() => {
              props.setContentStateFn("none");
              props.localStoreController.setModalKeyStorage(
                props.survey_template_id,
                "DO_NOT_DISTURB",
                "true"
              );
            }}
          >
            {props.preview_reject_button_text}
          </button>
        </div>
      </React.Fragment>
    );
  };

export default PreviewContent