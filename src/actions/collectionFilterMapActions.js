import {
  SET_COLLECTION_FILTER_MAP_AOI,
  SET_COLLECTION_FILTER_MAP_CENTER,
  SET_COLLECTION_FILTER_MAP_FILTER,
  SET_COLLECTION_FILTER_MAP_ZOOM,
  SET_COLLECTION_FILTER_MAP_MOVE_MAP,
  SET_COLLECTION_FILTER_MAP_SELECTED_COUNTY_NAME
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

export const setCollectionFilterMapMoveMap = (collectionFilterMapMoveMap) => {
  return (dispatch) => {
    dispatch({
      type: SET_COLLECTION_FILTER_MAP_MOVE_MAP,
      payload: { collectionFilterMapMoveMap }
    })
  }
};

export const setCollectionFilterMapSelectedCountyName = (collectionFilterMapSelectedCountyName) => {
  return (dispatch) => {
    dispatch({
      type: SET_COLLECTION_FILTER_MAP_SELECTED_COUNTY_NAME,
      payload: { collectionFilterMapSelectedCountyName }
    })
  }
};
