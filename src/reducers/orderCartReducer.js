import {
  ADD_COLLECTION_TO_CART,
  REMOVE_COLLECTION_FROM_CART,
  EMPTY_CART,

  UPLOAD_ORDER_BEGIN,
  UPLOAD_ORDER_SUCCESS,
  UPLOAD_ORDER_FAILURE,

  SUBMIT_ORDER_BEGIN,
  SUBMIT_ORDER_SUCCESS,
  SUBMIT_ORDER_FAILURE
} from '../constants/orderCartActionTypes';

const initialState = {
  orders: {},
  uploading: false,
  uploadError: null,
  submitting: false,
  submitError: null
};

export default function orderCartReducer(state = initialState, action) {
  switch(action.type) {

    case ADD_COLLECTION_TO_CART:
      const formObj = {};
      formObj[action.payload.collectionId] = action.payload.formInfo;
      const newOrders = {...state.orders, ...formObj};
      return {
        ...state,
        orders: newOrders
      };

    case REMOVE_COLLECTION_FROM_CART:
      const { [action.payload.collectionId]:value , ...removedOrders } = state.orders;
      return {
        ...state,
        orders: removedOrders
      };

    case EMPTY_CART:
      return {
        ...state,
        orders: {}
      };

    // AOI Upload
    case UPLOAD_ORDER_BEGIN:
      return {
        ...state,
        uploading: true,
        uploadError: null
      };

    case UPLOAD_ORDER_SUCCESS:
      return {
        ...state,
        uploading: false,
        uploadError: null
      };

    case UPLOAD_ORDER_FAILURE:
      return {
        uploading: false,
        uploadError: action.payload.error
      };

    // Order Cart Submission
    case SUBMIT_ORDER_BEGIN:
      return {
        ...state,
        submitting: true,
        submitError: null
      };

    case SUBMIT_ORDER_SUCCESS:
      return {
        ...state,
        submitting: false,
        submitError: null
      };

    case SUBMIT_ORDER_FAILURE:
      return {
        submitting: false,
        submitError: action.payload.error
      };

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
