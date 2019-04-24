import {
  SET_COLLECTION_SEARCH_QUERY,
  SET_COLLECTION_SEARCH_SUGGESTIONS_QUERY
} from '../constants/collectionSearcherActionTypes';

export const setCollectionSearchQuery = (collectionSearchQuery) => {
  return (dispatch) => {
    dispatch({
      type: SET_COLLECTION_SEARCH_QUERY,
      payload: { collectionSearchQuery }
    })
  }
};

export const setCollectionSearchSuggestionsQuery = (collectionSearchSuggestionsQuery) => {
  return (dispatch) => {
    dispatch({
      type: SET_COLLECTION_SEARCH_SUGGESTIONS_QUERY,
      payload: { collectionSearchSuggestionsQuery }
    })
  }
};
