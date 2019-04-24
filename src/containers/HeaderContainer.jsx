import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { catalogActions,
         urlTrackerActions } from '../actions';
import {
  getAllCollections
} from '../selectors/collectionSelectors';
import Header from '../components/Header';

const mapStateToProps = state => ({
  collections: getAllCollections(state),
  orders: state.orderCart.orders,
  catalogFilterUrl: state.urlTracker.catalogFilterUrl,
  selectedCollection: state.collections.selectedCollection,
  theme: state.colorTheme.theme,
  view: state.catalog.view,
  toolDrawerStatus: state.toolDrawer.toolDrawerStatus,
  toolDrawerVariant: state.toolDrawer.toolDrawerVariant
});

const mapDispatchToProps = dispatch => ({
  setUrl: (newUrl, history) => {
    dispatch(urlTrackerActions.setUrl(newUrl, history));
  },
  clearPreviousUrl: () => {
    dispatch(urlTrackerActions.clearPreviousUrl());
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  },
  setViewOrderCart: () => {
    dispatch(catalogActions.setViewOrderCart());
  },
  setViewCollection: () => {
    dispatch(catalogActions.setViewCollection());
  }
})

const HeaderContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(Header));

export default HeaderContainer;
