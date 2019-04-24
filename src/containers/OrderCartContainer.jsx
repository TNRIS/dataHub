import { connect } from 'react-redux';

import OrderCart from '../components/OrderCart';

import { catalogActions,
         collectionActions,
         orderCartActions,
         urlTrackerActions } from '../actions';
import { getAllCollections } from '../selectors/collectionSelectors';

const mapStateToProps = state => ({
  collections: getAllCollections(state),
  orders: state.orderCart.orders,
  previousUrl: state.urlTracker.previousUrl,
  submitting: state.orderCart.submitting,
  submitError: state.orderCart.submitError
});

const mapDispatchToProps = dispatch => ({
  removeCollectionFromCart: (collectionId) => {
    dispatch(orderCartActions.removeCollectionFromCart(collectionId));
  },
  submitOrderSuccess: () => {
    dispatch(orderCartActions.submitOrderSuccess());
  },
  submitOrderCartForm: (formInfo) => {
    dispatch(orderCartActions.submitOrderCartForm(formInfo));
  },
  setUrl: (newUrl, history) => {
    dispatch(urlTrackerActions.setUrl(newUrl, history))
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  },
  setViewCollection: () => {
    dispatch(catalogActions.setViewCollection());
  },
  selectCollection: (collectionId) => {
    dispatch(collectionActions.selectCollection(collectionId));
  }
})

const OrderCartContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(OrderCart);

export default OrderCartContainer;
