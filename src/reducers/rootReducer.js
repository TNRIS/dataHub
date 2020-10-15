import { combineReducers } from "redux";
import { connectRouter } from 'connected-react-router';

import catalog from './catalogReducer';
import collections from './collectionReducer';
import collectionFilter from './collectionFilterReducer';
import collectionFilterMap from './collectionFilterMapReducer';
import collectionSearcher from './collectionSearcherReducer';
import collectionSorter from './collectionSorterReducer';
import collectionTimeslider from './collectionTimesliderReducer';
import colorTheme from './colorThemeReducer';
import contact from './contactReducer';
import geoSearcher from './geoSearcherReducer';
import orderCart from './orderCartReducer';
import resources from './resourceReducer';
import toolDrawer from './toolDrawerReducer';
import urlTracker from './urlTrackerReducer';
import apiModal from './apiModalReducer';

const rootReducer = (history) => combineReducers({
  router: connectRouter(history),
  apiModal,
  catalog,
  collections,
  collectionFilter,
  collectionFilterMap,
  collectionSearcher,
  collectionSorter,
  collectionTimeslider,
  colorTheme,
  contact,
  geoSearcher,
  orderCart,
  resources,
  toolDrawer,
  urlTracker,
})

export default rootReducer;
