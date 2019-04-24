import {
  SET_COLLECTION_FILTER_MAP_AOI,
  SET_COLLECTION_FILTER_MAP_CENTER,
  SET_COLLECTION_FILTER_MAP_FILTER,
  SET_COLLECTION_FILTER_MAP_ZOOM
} from '../constants/collectionFilterMapActionTypes';

import { POP_BROWSER_STORE } from '../constants/catalogActionTypes';

// set the initial values for the filter, map center, and zoom level
// these will be passed to the component when it is instantiated
const initialState = {
  collectionFilterMapAoi: {},
  collectionFilterMapCenter: {lng: -99.341389, lat: 31.33},
  collectionFilterMapFilter: [],
  collectionFilterMapZoom: 5.8
};

export default function collectionFilterMapReducer(state = initialState, action) {
  switch(action.type) {
    case SET_COLLECTION_FILTER_MAP_AOI:
      // Set the user defined aoi rectangle from the collection filter map in the state
      return {
        ...state,
        collectionFilterMapAoi: action.payload.collectionFilterMapAoi
      };

    case SET_COLLECTION_FILTER_MAP_CENTER:
      // Set the center x,y of the collection filter map in the state
      return {
        ...state,
        collectionFilterMapCenter: action.payload.collectionFilterMapCenter
      };

    case SET_COLLECTION_FILTER_MAP_FILTER:
      // Set the collection filter map filter in the state
      return {
        ...state,
        collectionFilterMapFilter: action.payload.collectionFilterMapFilter
      };

    case SET_COLLECTION_FILTER_MAP_ZOOM:
      // Set the zoom level of the collection filter map in the state
      return {
        ...state,
        collectionFilterMapZoom: action.payload.collectionFilterMapZoom
      };

    case POP_BROWSER_STORE:
      return Object.assign({}, action.payload.collectionFilterMap);

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
