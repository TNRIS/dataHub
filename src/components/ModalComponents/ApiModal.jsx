import React, { useEffect, useState } from "react";
import FlexModal from "./FlexModal";
import SurveyJSContainer from "./SurveyJSContainer";

const PreviewContent = (props) => {
  return (
    <React.Fragment>
      <div /* style={{ ...preview_content_style }} */>
        {props.preview_header ? <h2>{props.preview_header}</h2> : null}
        {props.preview_text ? <p>{props.preview_text}</p> : null}
      </div>
      <div style={{ ...props.preview_buttons_container_style }}>
        <button
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
          aria-label={props.later_button_text}
          onClick={() => props.setContentStateFn("minimized")}
        >
          {props.later_button_text}
        </button>
        <button
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
const FullContent = (props) => {
  const onCompleteSurveyFunction = (surveyResponses) => {
    console.log(surveyResponses, navigator.platform, navigator.userAgent);
    props.localStoreController.setModalKeyStorage(
      props.modal_id,
      "SUBMITTED_AT",
      Date.now()
    );
    props.setContentStateFn("none");
  };
  return (
    <React.Fragment>
      {props.full_header && props.full_text && !props.survey_id ? (
        <React.Fragment>
          <h1>{props.full_header}</h1>
          <div>{props.full_text}</div>
        </React.Fragment>
      ) : (
        <SurveyJSContainer
          surveyId={props.survey_id}
          onCompleteSurveyFunction={onCompleteSurveyFunction}
        />
      )}
    </React.Fragment>
  );
};
const MinimizedContent = (props) => {
  return (
    <React.Fragment>
      <div
        onClick={() => props.setContentStateFn("preview")}
        style={{
          display: "flex",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        <span className={"material-icons mdc-fab__icon"}>
          {props.minimized_icon}
        </span>
        {props.minimized_text ? <strong>{props.minimized_text}</strong> : null}
      </div>
    </React.Fragment>
  );
};

export const ApiModal = (props) => {
  const [contentState, setContentState] = useState(props.default_content_state);
  const [timeLeft, setTimeLeft] = useState(props.display_delay);

  const localStoreController = {
    getModalKeyStorage: (modalId, key) => {
      const itemKey = `modal::${modalId}::${key}`;
      return window.localStorage.getItem(itemKey);
    },
    setModalKeyStorage: (modalId, key, value) => {
      const itemKey = `modal::${modalId}::${key}`;
      window.localStorage.setItem(itemKey, value);
    },
  };

  useEffect(() => {
    setContentState(props.default_content_state);
    setTimeLeft(props.display_delay);
  }, [props.default_content_state, props.display_delay]);

  //Decrements timeLeft until timeLeft === 0
  useEffect(() => {
    //fired on load, and every time dependency timeLeft changes (state value)
    const doNotDisturb = localStoreController.getModalKeyStorage(
      props.modal_id,
      "DO_NOT_DISTURB"
    );

    const submittedAt = localStoreController.getModalKeyStorage(
      props.modal_id,
      "SUBMITTED_AT"
    );

    if (timeLeft > 0 && !doNotDisturb && !submittedAt) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      if (timeLeft === 0) {
        clearInterval(timer);
      }
    }
  }, [timeLeft, localStoreController, props.modal_id]);

  //switch content of modal via switch function
  const modalContentSwitch = () => {
    switch (contentState) {
      case "preview":
        return (
          <FlexModal
            modalPosition={props.preview_position}
            modalSize={props.preview_size}
            backgroundOverlayColor={props.preview_background_color}
          >
            <PreviewContent
              modal_id={props.modal_id}
              preview_header={props.preview_header}
              preview_text={props.preview_text}
              later_button_text={props.later_button_text}
              accept_button_text={props.accept_button_text}
              reject_button_text={props.reject_button_text}
              setContentStateFn={setContentState}
              localStoreController={localStoreController}
            />
          </FlexModal>
        );
      case "full":
        return (
          <FlexModal
            modalPosition={props.full_position}
            modalSize={props.full_size}
            backgroundOverlayColor={props.full_background_color}
          >
            <FullContent
              modal_id={props.modal_id}
              setContentStateFn={setContentState}
              full_header={props.full_header}
              full_text={props.full_text}
              sheet_id={props.sheet_id}
              survey_id={props.survey_id}
              localStoreController={localStoreController}
            />
          </FlexModal>
        );
      case "minimized":
        return (
          <FlexModal>
            <MinimizedContent
              modal_id={props.modal_id}
              setContentStateFn={setContentState}
              localStoreController={localStoreController}
              minimized_text={props.minimized_text}
              minimized_icon={props.minimized_icon}
            />
          </FlexModal>
        );
      case "none":
        return null;
      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      {timeLeft < 1 &&
      !localStoreController.getModalKeyStorage(
        props.modal_id,
        "DONOTDISTURB"
      ) &&
      !localStoreController.getModalKeyStorage(props.modal_id, "SUBMITTED_AT")
        ? modalContentSwitch()
        : null}
    </React.Fragment>
  );
};
