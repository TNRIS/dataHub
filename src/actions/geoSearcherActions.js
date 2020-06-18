import {
  SET_GEOSEARCHER_INPUT_VALUE
} from '../constants/geoSearcherActionTypes';

export const setGeoSearcherInputValue = (geoSearcherInputValue) => {
  return (dispatch) => {
    dispatch({
      type: SET_GEOSEARCHER_INPUT_VALUE,
      payload: { geoSearcherInputValue }
    })
  }
}
