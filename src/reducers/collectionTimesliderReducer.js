import {
  SET_COLLECTION_TIMESLIDER
} from '../constants/collectionTimesliderActionTypes';

import { POP_BROWSER_STORE } from '../constants/catalogActionTypes';

const initialState = {
  collectionTimeslider: [1800, 2100]
};

export default function collectionTimesliderReducer(state = initialState, action) {
  switch(action.type) {
    case SET_COLLECTION_TIMESLIDER:
      // Set the collection user chosen timeslider values in the state
      return {
        ...state,
        collectionTimeslider: action.payload.collectionTimeslider
      };

    case POP_BROWSER_STORE:
      return Object.assign({}, action.payload.collectionTimeslider);

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
