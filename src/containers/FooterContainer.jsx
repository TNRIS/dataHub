import { connect } from "react-redux";
import { catalogActions, urlTrackerActions } from "../actions";
import { withRouter } from "react-router";

import Footer from "../components/Footer";

const mapStateToProps = (state) => ({
  theme: state.colorTheme.theme,
  view: state.catalog.view,
  toolDrawerStatus: state.toolDrawer.toolDrawerStatus,
  toolDrawerVariant: state.toolDrawer.toolDrawerVariant,
});

const mapDispatchToProps = (dispatch) => ({
  setUrl: (newUrl, history) => {
    dispatch(urlTrackerActions.setUrl(newUrl, history));
  },
  setViewAbout: () => {
    dispatch(catalogActions.setViewAbout());
  },
});

const FooterContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Footer)
);

export default FooterContainer;
