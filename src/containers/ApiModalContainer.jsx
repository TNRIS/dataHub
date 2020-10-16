import { connect } from "react-redux";
import { withRouter } from "react-router";

import ApiModalFeed from "../components/ModalComponents/ApiModalFeed";

import { apiModalActions } from "../actions";

const mapStateToProps = (state) => ({
  modals: state.apiModal.modals,
  loading: state.apiModal.loading,
  error: state.apiModal.error,
});
const mapDispatchToProps = (dispatch) => ({
  fetchModals: () => {
    dispatch(apiModalActions.fetchModals());
  }
});

const ApiModalContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ApiModalFeed)
);

export default ApiModalContainer;
