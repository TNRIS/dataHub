import {
  SET_VIEW_CATALOG,
  SET_VIEW_COLLECTION,
  SET_VIEW_ORDER_CART,
  SET_VIEW_GEO_FILTER,
  SET_VIEW_NOT_FOUND,
  POP_BROWSER_STORE
} from '../constants/catalogActionTypes';

export const setViewCatalog = () => ({
  type: SET_VIEW_CATALOG
});

export const setViewCollection = () => ({
  type: SET_VIEW_COLLECTION
});

export const setViewOrderCart = () => ({
  type: SET_VIEW_ORDER_CART
});

export const setViewGeoFilter = () => ({
  type: SET_VIEW_GEO_FILTER
});

export const setViewNotFound = () => ({
  type: SET_VIEW_NOT_FOUND
});

export const popBrowserStore = (state) => ({
  type: POP_BROWSER_STORE,
  payload: state
})
