import React, { useEffect, useState } from "react";
import FlexModal from "./FlexModal";

import PreviewContent from "./PreviewContent";
import FullContent from "./FullContent";
import MinimizedContent from "./MinimizedContent";
import ModalHeaderActionBar from "./ModalHeaderActionBar";

export const ApiModal = (props) => {
  const [contentState, setContentState] = useState(props.initial_content_state);
  const [timeLeft, setTimeLeft] = useState(props.display_delay_template_type);

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

  // Fired on load, when props update
  useEffect(() => {
    setContentState(props.initial_content_state);
    setTimeLeft(props.display_delay_template_type);
  }, [props.initial_content_state, props.display_delay_template_type]);

  //Decrements timeLeft until timeLeft === 0
  useEffect(() => {
    //fired on load, and every time dependency timeLeft changes (state value)
    const doNotDisturb = localStoreController.getModalKeyStorage(
      props.survey_template_id,
      "DO_NOT_DISTURB"
    );

    const submittedAt = localStoreController.getModalKeyStorage(
      props.survey_template_id,
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
  }, [timeLeft, localStoreController, props.survey_template_id]);

  //switch content of modal via switch function
  const modalContentSwitch = () => {
    switch (contentState) {
      case "preview":
        return (
          <FlexModal
            modalPosition={props.preview_position}
            modalSize={props.preview_size}
            backgroundOverlayColor={props.preview_background_color}
            modalPadding={"2vw"}
            modalBackground={"#1E8DC1"}
            modalTextColor={"white"}
          >
            <PreviewContent
              survey_template_id={props.survey_template_id}
              preview_header={props.preview_header}
              preview_body_text={props.preview_body_text}
              preview_later_button_text={props.preview_later_button_text}
              preview_accept_button_text={props.preview_accept_button_text}
              preview_reject_button_text={props.preview_reject_button_text}
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
            modalPadding={"16px"}
          >
            <React.Fragment>
              {props.content_type === "multi-modal" && (
                <React.Fragment>
                  <ModalHeaderActionBar
                    modalActionBarButtonIcon="minimize"
                    setContentStateFn={() => {
                      setContentState("minimized");
                    }}
                  />
                  <FullContent
                    survey_template_id={props.survey_template_id}
                    setContentStateFn={setContentState}
                    full_header={props.full_header}
                    full_body_text={props.full_body_text}
                    sheet_id={props.sheet_id}
                    survey_id={props.survey_id}
                    modal_id={props.survey_template_id}
                    localStoreController={localStoreController}
                  />  
                </React.Fragment>
                
              )}
              {props.content_type === "single-modal" && (
                <React.Fragment>
                  <ModalHeaderActionBar
                    modalActionBarButtonIcon="close"
                    setContentStateFn={() => {
                      setContentState("none");
                      localStoreController.setModalKeyStorage(
                        props.survey_template_id,
                        "DO_NOT_DISTURB",
                        "true"
                      );
                    }}
                  />
                  <h2 className="mdc-typography--headline4">
                    {props.full_header}
                  </h2>
                  <div
                    dangerouslySetInnerHTML={{ __html: props.full_body_text }}
                  />
                </React.Fragment>
              )}
            </React.Fragment>
          </FlexModal>
        );
      case "minimized":
        return (
          <MinimizedContent
            survey_template_id={props.survey_template_id}
            setContentStateFn={setContentState}
            localStoreController={localStoreController}
            minimized_text={props.minimized_text}
            minimized_icon={props.minimized_icon}
          />
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
        props.survey_template_id,
        "DONOTDISTURB"
      ) &&
      !localStoreController.getModalKeyStorage(
        props.survey_template_id,
        "SUBMITTED_AT"
      )
        ? modalContentSwitch()
        : null}
    </React.Fragment>
  );
};
