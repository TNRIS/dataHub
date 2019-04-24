
import {
  SET_SORT_AZ,
  SET_SORT_ZA,
  SET_SORT_NEW,
  SET_SORT_OLD,
} from '../constants/collectionSorterActionTypes';

export const setSortAZ = () => {
  return (dispatch) => {
    dispatch({
      type: SET_SORT_AZ
    })
  }
};

export const setSortZA = () => {
  return (dispatch) => {
    dispatch({
      type: SET_SORT_ZA
    })
  }
};

export const setSortNew = () => {
  return (dispatch) => {
    dispatch({
      type: SET_SORT_NEW
    })
  }
};

export const setSortOld = () => {
  return (dispatch) => {
    dispatch({
      type: SET_SORT_OLD
    })
  }
};
