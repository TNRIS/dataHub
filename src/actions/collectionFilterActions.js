import {
  SET_COLLECTION_FILTER,
} from '../constants/collectionFilterActionTypes';

export const setCollectionFilter = (collectionFilter) => {
  return (dispatch) => {
    dispatch({
      type: SET_COLLECTION_FILTER,
      payload: { collectionFilter }
    })
  }
};
