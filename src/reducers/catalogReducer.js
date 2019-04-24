import {
  SET_VIEW_CATALOG,
  SET_VIEW_COLLECTION,
  SET_VIEW_ORDER_CART,
  SET_VIEW_GEO_FILTER,
  SET_VIEW_NOT_FOUND,
  POP_BROWSER_STORE
} from '../constants/catalogActionTypes';

const initialState = {
  view: 'catalog'
};

export default function catalogReducer(state = initialState, action) {
  switch(action.type) {
    case SET_VIEW_CATALOG:
      return {
        ...state,
        view: 'catalog'
      };

    case SET_VIEW_COLLECTION:
      return {
        ...state,
        view: 'collection'
      };

    case SET_VIEW_ORDER_CART:
      return {
        ...state,
        view: 'orderCart'
      };

    case SET_VIEW_GEO_FILTER:
      return {
        ...state,
        view: 'geoFilter'
      };

    case SET_VIEW_NOT_FOUND:
      return {
        ...state,
        view: 'notFound'
      };

    case POP_BROWSER_STORE:
      return Object.assign({}, action.payload.catalog);

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
