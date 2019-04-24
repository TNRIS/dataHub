import {
  SET_COLLECTION_SEARCH_QUERY,
  SET_COLLECTION_SEARCH_SUGGESTIONS_QUERY
} from '../constants/collectionSearcherActionTypes';

import { POP_BROWSER_STORE } from '../constants/catalogActionTypes';

const initialState = {
  collectionSearchQuery: '',
  collectionSearchSuggestionsQuery: ''
};

export default function collectionSearcherReducer(state = initialState, action) {
  switch(action.type) {
    case SET_COLLECTION_SEARCH_QUERY:
      // Set the collection search query in the state
      return {
        ...state,
        collectionSearchQuery: action.payload.collectionSearchQuery
      };

    case SET_COLLECTION_SEARCH_SUGGESTIONS_QUERY:
      // Set the collection search suggestions query in the state
      return {
        ...state,
        collectionSearchSuggestionsQuery: action.payload.collectionSearchSuggestionsQuery
      };

    case POP_BROWSER_STORE:
      return Object.assign({}, action.payload.collectionSearcher);

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
