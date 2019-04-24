import {
  SET_URL,
  LOG_FILTER_CHANGE,
  CLEAR_PREVIOUS_URL
} from '../constants/urlTrackerActionTypes';

import { POP_BROWSER_STORE } from '../constants/catalogActionTypes';

const initialState = {
  previousUrl: window.location.pathname,
  catalogFilterUrl: "/"
}

export default function urlTrackerReducer(state = initialState, action) {
  switch(action.type) {
    case SET_URL:
      // Set previous url in the state
      return {
        ...state,
        previousUrl: action.payload.previousUrl
      };

    case LOG_FILTER_CHANGE:
    // logs the catalog url for filter tracking
      return {
        ...state,
        catalogFilterUrl: action.payload.catalogFilterUrl
      };

    case CLEAR_PREVIOUS_URL:
      // Clear previous url in the state
      return {
        ...state,
        previousUrl: "/"
      };

    case POP_BROWSER_STORE:
      return Object.assign({}, action.payload.urlTracker);

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
