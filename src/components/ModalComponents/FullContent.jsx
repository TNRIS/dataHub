import React from "react";
import SurveyJSContainer from "./SurveyJSContainer";

const FullContent = (props) => {
  const onCompleteSurveyFunction = (surveyResponses) => {
    props.localStoreController.setModalKeyStorage(
      props.survey_template_id,
      "SUBMITTED_AT",
      Date.now()
    );
    props.setContentStateFn("none");
  };
  return (
    <div className={"modalFullContainer"}>
      {props.full_header && props.full_text && (
        <React.Fragment>
          <h1>{props.full_header}</h1>
          <div>{props.full_text}</div>
        </React.Fragment>
      )}
      {props.survey_id && (
        <SurveyJSContainer
          modalId={props.modal_id}
          sheetId={props.sheet_id}
          surveyId={props.survey_id}
          onCompleteSurveyFunction={onCompleteSurveyFunction}
        />
      )}
    </div>
  );
};

export default FullContent;
