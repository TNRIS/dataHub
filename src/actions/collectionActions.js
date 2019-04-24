import { normalize, schema } from 'normalizr';

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

import { setViewCollection } from './catalogActions';
import { closeToolDrawer } from './toolDrawerActions';

import { store } from '../App';

// -------------
// Initial Store of all collections for display as cards
// -------------

// --- retrieval lifecycle actions ---
export const fetchCollectionsBegin = () => ({
  type: FETCH_COLLECTIONS_BEGIN
});

export const fetchCollectionsSuccess = (collections) => ({
  type: FETCH_COLLECTIONS_SUCCESS,
  payload: { collections }
});

export const fetchCollectionsWithSelectedSuccess = (collections, selected) => ({
  type: FETCH_COLLECTIONS_WITH_SELECTED_SUCCESS,
  payload: {
    collections: collections,
    selected: selected
  }
});

export const fetchCollectionsFailure = (error) => ({
  type: FETCH_COLLECTIONS_FAILURE,
  payload: { error }
});

// --- retrieve and normalize collections actions ---
function handleErrors(response) {
  // Handle HTTP errors since fetch won't.
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

function normalizeCollections(originalData) {
  // Normalize the api response json to a flattened state
  // Define collections schema
  const collectionSchema = new schema.Entity(
    'collectionsById',
    undefined,
    { idAttribute: 'collection_id'}
  );
  return normalize(originalData, [collectionSchema]);
}

function historicalRecursiveFetcher(dispatch, getState, apiQuery, response) {
  // recursive api endpoint fetcher for handling pagination
  fetch(apiQuery)
  .then(handleErrors)
  .then(res => res.json())
  .then(json => {
    let allResults = response.concat(json.results);
    if (json.next) {
      historicalRecursiveFetcher(dispatch, getState, json.next, allResults);
    }
    else {
      let normalizedJson = normalizeCollections(allResults);
      let currentStore = store.getState();
      const pathname = currentStore.router.location.pathname;
      if (!pathname.includes('/collection/')) {
        dispatch(fetchCollectionsSuccess(normalizedJson));
      }
      else if (!normalizedJson.result.includes(pathname.replace('/collection/',''))) {
        dispatch(fetchCollectionsSuccess(normalizedJson));
      }
      else {
        const collectionId = pathname.replace('/collection/','');
        dispatch(fetchCollectionsWithSelectedSuccess(normalizedJson, collectionId));
        dispatch(setViewCollection());
        dispatch(closeToolDrawer());
      }
      return normalizedJson;
    }
  })
  .catch(error => dispatch(fetchCollectionResourcesFailure(error)));
}

export function fetchHistorical(dispatch, getState, results) {
  const apiQuery = 'https://data.tnris.org/api/v1/historical/collections';
  return historicalRecursiveFetcher(dispatch, getState, apiQuery, results);
}

export function fetchCollections() {
  return (dispatch, getState) => {
    dispatch(fetchCollectionsBegin());
    return fetch('https://data.tnris.org/api/v1/collections')
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        return fetchHistorical(dispatch, getState, json.results);
      })
      .catch(error => dispatch(fetchCollectionsFailure(error)));
  };
}

// -------------
// Manage active collection when collection card is clicked
// -------------

export const selectCollection = (collectionId) => {
  return (dispatch) => {
    dispatch({
      type: SELECT_COLLECTION,
      payload: { collectionId }
    })
  }
};

export const clearSelectedCollection = () => ({
  type: CLEAR_SELECTED_COLLECTION
});

// -------------
// Manage active collection areas/resources when collection card is clicked
// -------------

// --- retrieval lifecycle actions ---
export const fetchCollectionResourcesBegin = () => ({
  type: FETCH_COLLECTION_RESOURCES_BEGIN
});

export const fetchCollectionResourcesSuccess = (resources) => ({
  type: FETCH_COLLECTION_RESOURCES_SUCCESS,
  payload: { resources }
});

export const fetchCollectionResourcesFailure = (error) => ({
  type: FETCH_COLLECTION_RESOURCES_FAILURE,
  payload: { error }
});

// --- retrieve and normalize collections actions ---

function normalizeCollectionResources(originalData) {
  // Normalize the api response json to a flattened state
  // Define collectionAreas schema
  const collectionResourcesSchema = new schema.Entity(
    'resourcesById',
    {},
    { idAttribute: 'resource_id'}
  );
  return normalize(originalData, [collectionResourcesSchema]);
}

function resourcesRecursiveFetcher(dispatch, getState, apiQuery, collectionId, response) {
  // recursive api endpoint fetcher for handling pagination
  fetch(apiQuery)
  .then(handleErrors)
  .then(res => res.json())
  .then(json => {
    let allResults = response.concat(json.results);
    if (json.next && getState().collections.selectedCollection === collectionId) {
      resourcesRecursiveFetcher(dispatch, getState, json.next, collectionId, allResults);
    }
    else {
      let normalizedJson = normalizeCollectionResources(allResults);
      dispatch(fetchCollectionResourcesSuccess(normalizedJson));
      return normalizedJson;
    }
  })
  .catch(error => dispatch(fetchCollectionResourcesFailure(error)));
}

export function fetchCollectionResources(collectionId) {
  const apiQuery = 'https://data.tnris.org/api/v1/resources?collection_id=' + collectionId;
  return (dispatch, getState) => {
    dispatch(fetchCollectionResourcesBegin());
    return resourcesRecursiveFetcher(dispatch, getState, apiQuery, collectionId, []);
  };
}
