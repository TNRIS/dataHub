import {connect} from 'react-redux'

import {orderCartActions, urlTrackerActions, catalogActions} from '../actions'
import {getAllCollections} from '../selectors/collectionSelectors'
import OrderTnrisDataForm from '../components/OrderTnrisDataForm'

const mapStateToProps = state => ({
  collections: getAllCollections(state),
  selectedCollection: state.collections.selectedCollection,
  orders: state.orderCart.orders,
  uploading: state.orderCart.uploading,
  uploadError: state.orderCart.uploadError
});

const mapDispatchToProps = dispatch => ({
  setUrl: (newUrl, history) => {
    dispatch(urlTrackerActions.setUrl(newUrl, history));
  },
  setViewOrderCart: () => {
    dispatch(catalogActions.setViewOrderCart());
  },
  addCollectionToCart: (collectionId, formInfo) => {
    dispatch(orderCartActions.addCollectionToCart(collectionId, formInfo));
  },
  uploadOrderSuccess: () => {
    dispatch(orderCartActions.uploadOrderSuccess());
  },
  uploadOrderFile: (collectionId, cartInfo) => {
    dispatch(orderCartActions.uploadOrderFile(collectionId, cartInfo));
  }
})

const OrderTnrisDataFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(OrderTnrisDataForm);

export default OrderTnrisDataFormContainer;
