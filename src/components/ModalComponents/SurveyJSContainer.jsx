import React, { useEffect, useState } from "react";
import * as Survey from "survey-react";
import "survey-react/survey.css";

const SurveyJSContainer = ({
  surveyId,
  modalId,
  sheetId,
  onCompleteSurveyFunction,
  isDisplayed = true,
}) => {

  const postSurvey = async (jsonPayload) => {
    const url = process.env.REACT_APP_API_URL + '/api/v1/contact/survey/submit/'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(jsonPayload)
    });

    return await response.json();
  }

  const [surveyJSON, setSurveyJSON] = useState(null);
  useEffect(() => {
    const getSurveyJSON = async () => {
      const endpoint = `https://api.surveyjs.io/public/Survey/getSurvey?surveyId=${surveyId}`;
      const request = await fetch(endpoint);
      const surveyBody = await request.json();

      setSurveyJSON(surveyBody);
    };
    getSurveyJSON();
  }, [surveyId]);

  const onComplete = (survey, options) => {

    sheetId && postSurvey({
      sheet_id: sheetId,
      survey_id: surveyId,
      survey_response: {
        ...survey.data,
        user_agent: navigator.userAgent,
        submit_time: Date.now(),
        survey_id: surveyId,
        modal_id: modalId
      }
    })
    onCompleteSurveyFunction();
  };

  const defaultThemeColors = Survey.StylesManager.ThemeColors["default"];
  defaultThemeColors["$main-color"] = "#1E8DC1";
  defaultThemeColors["$main-hover-color"] = "#1e8dc1";
  defaultThemeColors["$text-color"] = "#333";
  defaultThemeColors["$header-color"] = "#fff";
  defaultThemeColors["$header-background-color"] = "#fff";
  defaultThemeColors["$body-container-background-color"] = "#fff";

  Survey.StylesManager.applyTheme();

  const srvy = new Survey.Model(surveyJSON);

  return surveyJSON && isDisplayed ? (
    <Survey.Survey model={srvy} onComplete={onComplete} />
  ) : null;
};

export default SurveyJSContainer;
