import { connect } from 'react-redux';

import NotFound from '../components/NotFound';
import { catalogActions } from '../actions';

const mapStateToProps = (state) => ({
  view: state.catalog.view
});

const mapDispatchToProps = dispatch => ({
  setViewNotFound: () => {
    dispatch(catalogActions.setViewNotFound());
  }
})

const NotFoundContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotFound);

export default NotFoundContainer;
