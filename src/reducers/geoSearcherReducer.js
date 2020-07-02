import {
  SET_GEOSEARCHER_INPUT_VALUE
} from '../constants/geoSearcherActionTypes';

// set the initial value for the input
const initialState = {
  geoSearcherInputValue: "",
};

export default function geoSearcherReducer(state = initialState, action) {
  switch(action.type) {
    case SET_GEOSEARCHER_INPUT_VALUE:
      // Set the input value of the GeoSearcher
      return {
        ...state,
        geoSearcherInputValue: action.payload.geoSearcherInputValue
      };

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
