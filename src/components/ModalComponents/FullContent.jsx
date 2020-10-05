import React from "react";
import SurveyJSContainer from "./SurveyJSContainer";

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

export default FullContent;
