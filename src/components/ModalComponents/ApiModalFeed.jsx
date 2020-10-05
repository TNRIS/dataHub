import React, { useEffect } from "react";
import { ApiModal } from "./ApiModal";

const ApiModalFeed = (props) => {
  const fetchModals = props.fetchModals;

  useEffect(() => {
    fetchModals();
  }, [fetchModals]);

  if (props.loading) return <div>loading...</div>;
  if (props.modals.length < 1) return null;

  const modalsRenderer = () =>
    props.modals.map((mdl) => <ApiModal key={mdl.modal_id} {...mdl} />);
  return modalsRenderer();
};

export default ApiModalFeed;
