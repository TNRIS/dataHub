import React, { useEffect, useState } from "react";
import * as Survey from "survey-react";
import "survey-react/survey.css";

const SurveyJSContainer = ({
  surveyId,
  onCompleteSurveyFunction,
  isDisplayed = true,
}) => {
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
    onCompleteSurveyFunction(survey.data);
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
