import React from 'react'

const PreviewContent = (props) => {
    return (
      <React.Fragment>
        <div /* style={{ ...preview_content_style }} */>
          {props.preview_header ? <h2>{props.preview_header}</h2> : null}
          {props.preview_text ? <p>{props.preview_text}</p> : null}
        </div>
        <div style={{ ...props.preview_buttons_container_style, display: 'grid', gap: '8px' }}>
          <button
            className={"mdc-button mdc-button--raised"}
            aria-label={props.accept_button_text}
            onClick={() => {
              props.setContentStateFn("full");
              props.localStoreController.setModalKeyStorage(
                props.modal_id,
                "STARTED_AT",
                Date.now()
              );
            }}
          >
            {props.accept_button_text}
          </button>
          <button
            className={"mdc-button mdc-button--raised"}
            aria-label={props.later_button_text}
            onClick={() => props.setContentStateFn("minimized")}
          >
            {props.later_button_text}
          </button>
          <button
            className={"mdc-button mdc-button--raised"}
            aria-label={props.reject_button_text}
            onClick={() => {
              props.setContentStateFn("none");
              props.localStoreController.setModalKeyStorage(
                props.modal_id,
                "DO_NOT_DISTURB",
                "true"
              );
            }}
          >
            {props.reject_button_text}
          </button>
        </div>
      </React.Fragment>
    );
  };

export default PreviewContent