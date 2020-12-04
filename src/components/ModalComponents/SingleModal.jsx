import React from "react";
import { useState } from "react";
import ModalHeaderActionBar from "./ModalHeaderActionBar";

const SingleModal = ({
  full_header,
  full_body_text,
  survey_template_id,
  setContentStateFn,
  localStoreController,
}) => {
  const [toggle, setToggle] = useState(false);

  return (
    <React.Fragment>
      <ModalHeaderActionBar
        modalActionBarTitle={full_header}
        modalActionBarButtonIcon="close"
        setContentStateFn={() => {
          setContentStateFn("none");
          if(toggle){
            localStoreController.setModalKeyStorage(
                survey_template_id,
                "DO_NOT_DISTURB",
                "true"
            );    
          }
        }}
      />
      <div dangerouslySetInnerHTML={{ __html: full_body_text }} />
      <div className="mdc-form-field">
        <div className="mdc-touch-target-wrapper">
          <div className="mdc-checkbox mdc-checkbox--touch">
            <input
              type="checkbox"
              className="mdc-checkbox__native-control"
              id="checkbox-1"
              checked={toggle}
              onChange={ () => setToggle(toggle => !toggle)}
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
        </div>
        <label htmlFor="my-checkbox">Don't show this message again</label>
      </div>
    </React.Fragment>
  );
};

export default SingleModal;
