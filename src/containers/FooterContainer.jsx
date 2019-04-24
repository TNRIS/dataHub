import { connect } from 'react-redux';

import Footer from '../components/Footer';

const mapStateToProps = state => ({
  theme: state.colorTheme.theme,
  view: state.catalog.view,
  toolDrawerStatus: state.toolDrawer.toolDrawerStatus,
  toolDrawerVariant: state.toolDrawer.toolDrawerVariant
});

const FooterContainer = connect(
  mapStateToProps
)(Footer);

export default FooterContainer;
