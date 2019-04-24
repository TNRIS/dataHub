import {
  SET_COLLECTION_FILTER_MAP_AOI,
  SET_COLLECTION_FILTER_MAP_CENTER,
  SET_COLLECTION_FILTER_MAP_FILTER,
  SET_COLLECTION_FILTER_MAP_ZOOM,
} from '../constants/collectionFilterMapActionTypes';

export const setCollectionFilterMapAoi = (collectionFilterMapAoi) => {
  return (dispatch) => {
    dispatch({
      type: SET_COLLECTION_FILTER_MAP_AOI,
      payload: { collectionFilterMapAoi }
    })
  }
};

export const setCollectionFilterMapCenter = (collectionFilterMapCenter) => {
  return (dispatch) => {
    dispatch({
      type: SET_COLLECTION_FILTER_MAP_CENTER,
      payload: { collectionFilterMapCenter }
    })
  }
};

export const setCollectionFilterMapFilter = (collectionFilterMapFilter) => {
  return (dispatch) => {
    dispatch({
      type: SET_COLLECTION_FILTER_MAP_FILTER,
      payload: { collectionFilterMapFilter }
    })
  }
};

export const setCollectionFilterMapZoom = (collectionFilterMapZoom) => {
  return (dispatch) => {
    dispatch({
      type: SET_COLLECTION_FILTER_MAP_ZOOM,
      payload: { collectionFilterMapZoom }
    })
  }
};
