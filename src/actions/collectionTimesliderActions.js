import {
  SET_COLLECTION_TIMESLIDER
} from '../constants/collectionTimesliderActionTypes';

export const setCollectionTimeslider = (collectionTimeslider) => {
  return (dispatch) => {
    dispatch({
      type: SET_COLLECTION_TIMESLIDER,
      payload: { collectionTimeslider }
    })
  }
};
