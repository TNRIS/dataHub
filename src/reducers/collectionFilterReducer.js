import {
  SET_COLLECTION_FILTER
} from '../constants/collectionFilterActionTypes';

import { POP_BROWSER_STORE } from '../constants/catalogActionTypes';

const initialState = {
  collectionFilter: {}
};

export default function collectionFilterReducer(state = initialState, action) {
  switch(action.type) {
    case SET_COLLECTION_FILTER:
      // Set the collection filter in the state
      return {
        ...state,
        collectionFilter: action.payload.collectionFilter
      };

    case POP_BROWSER_STORE:
      return Object.assign({}, action.payload.collectionFilter);

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
