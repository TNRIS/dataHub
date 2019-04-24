import { connect } from 'react-redux';

import OrderCartView from '../components/OrderCartView';

import { catalogActions,
         collectionActions,
         urlTrackerActions } from '../actions';

const mapStateToProps = state => ({
  previousUrl: state.urlTracker.previousUrl
});

const mapDispatchToProps = dispatch => ({
  setUrl: (newUrl) => {
    dispatch(urlTrackerActions.setUrl(newUrl))
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  },
  setViewCollection: () => {
    dispatch(catalogActions.setViewCollection());
  },
  selectCollection: (collectionId) => {
    dispatch(collectionActions.selectCollection(collectionId));
  },
})

const OrderCartViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(OrderCartView);

export default OrderCartViewContainer;
