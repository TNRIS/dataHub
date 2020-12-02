import React, { useEffect } from "react";
import { ApiModal } from "./ApiModal";

const ApiModalFeed = (props) => {
  const fetchModals = props.fetchModals;

  useEffect(() => {
    fetchModals();
  }, [fetchModals]);

  if (props.loading) return null;
  if (props.modals.length < 1) return null;

  const modalsRenderer = () =>
    props.modals.map((mdl) => {
      if (mdl.dev_mode === true && process.env.NODE_ENV !== "development") {
        return null
      } else {
        return <ApiModal key={mdl.survey_template_id} {...mdl} />
      }
    });
  return modalsRenderer();
};

export default ApiModalFeed;
