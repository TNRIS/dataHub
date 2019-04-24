import {
  FETCH_COLLECTIONS_BEGIN,
  FETCH_COLLECTIONS_SUCCESS,
  FETCH_COLLECTIONS_FAILURE,
  FETCH_COLLECTIONS_WITH_SELECTED_SUCCESS,
  SELECT_COLLECTION,
  CLEAR_SELECTED_COLLECTION,
  FETCH_COLLECTION_RESOURCES_BEGIN,
  FETCH_COLLECTION_RESOURCES_SUCCESS,
  FETCH_COLLECTION_RESOURCES_FAILURE,
} from '../constants/collectionActionTypes';

import { POP_BROWSER_STORE } from '../constants/catalogActionTypes';

const initialState = {
  items: [],
  loading: true,
  error: null,
  selectedCollection: null,
  selectedCollectionResources: [],
  loadingResources: false,
  errorResources: null
};

export default function collectionReducer(state = initialState, action) {
  switch(action.type) {
    case FETCH_COLLECTIONS_BEGIN:
      // Mark the state as "loading" so we can show a spinner or something
      // Also, reset any errors. We're starting fresh.
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_COLLECTIONS_SUCCESS:
      // All done: set loading "false".
      // Also, replace the items with the ones from the server
      return {
        ...state,
        loading: false,
        items: action.payload.collections
      };

    case FETCH_COLLECTIONS_WITH_SELECTED_SUCCESS:
      // All done: set loading "false".
      // Also, replace the items with the ones from the server
      // Also, apply selected collection
      return {
        ...state,
        loading: false,
        items: action.payload.collections,
        selectedCollection: action.payload.selected
      };

    case FETCH_COLLECTIONS_FAILURE:
      // The request failed, but it did stop, so set loading to "false".
      // Save the error, and we can display it somewhere
      // Since it failed, we don't have items to display anymore, so set it empty.
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        items: []
      };

    case SELECT_COLLECTION:
      // Set the selectedCollection to the collection_id of the
      // collection a user chooses from the catalog
      return {
        ...state,
        selectedCollection: action.payload.collectionId
      };

    case CLEAR_SELECTED_COLLECTION:
      // Clear selectedCollection setting it back to null
      return {
        ...state,
        selectedCollection: null,
        selectedCollectionResources: []
      };

    case FETCH_COLLECTION_RESOURCES_BEGIN:
      // Mark the state as "loading" so we can show a spinner or something
      // Also, reset any errors. We're starting fresh.
      return {
        ...state,
        loadingResources: true,
        errorResources: null
      };

    case FETCH_COLLECTION_RESOURCES_SUCCESS:
      // All done: set loadingResources "false".
      // Also, replace the selectedCollectionResources with the ones from the server
      return {
        ...state,
        loadingResources: false,
        selectedCollectionResources: action.payload.resources
      };

    case FETCH_COLLECTION_RESOURCES_FAILURE:
      // The request failed, but it did stop, so set loading to "false".
      // Save the error, and we can display it somewhere
      // Since it failed, we don't have selectedCollectionResources to display anymore, so set it empty.
      return {
        ...state,
        loadingResources: false,
        errorResources: action.payload.error,
        selectedCollectionResources: []
      };

    case POP_BROWSER_STORE:
      return {
        ...state,
        selectedCollection: action.payload.collections.selectedCollection
      };

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
