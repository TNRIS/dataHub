import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import {
  catalogActions,
  collectionFilterMapActions,
  urlTrackerActions
} from '../actions';
import CollectionFilterMap from '../components/CollectionFilterMap';

const mapStateToProps = state => ({
  collectionFilterMapAoi: state.collectionFilterMap.collectionFilterMapAoi,
  collectionFilterMapCenter: state.collectionFilterMap.collectionFilterMapCenter,
  collectionFilterMapFilter: state.collectionFilterMap.collectionFilterMapFilter,
  collectionFilterMapZoom: state.collectionFilterMap.collectionFilterMapZoom,
  theme: state.colorTheme.theme,
  catalogFilterUrl: state.urlTracker.catalogFilterUrl,
  view: state.catalog.view
});

const mapDispatchToProps = dispatch => ({
  setCollectionFilterMapAoi: (collectionFilterMapAoi) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapAoi(collectionFilterMapAoi));
  },
  setCollectionFilterMapCenter: (collectionFilterMapCenter) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapCenter(collectionFilterMapCenter));
  },
  setCollectionFilterMapFilter: (collectionFilterMapFilter) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapFilter(collectionFilterMapFilter));
  },
  setCollectionFilterMapZoom: (collectionFilterMapZoom) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapZoom(collectionFilterMapZoom));
  },
  setUrl: (newUrl, history) => {
    dispatch(urlTrackerActions.setUrl(newUrl, history))
  },
  logFilterChange: (url) => {
    dispatch(urlTrackerActions.logFilterChange(url));
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  },
  setViewGeoFilter: () => {
    dispatch(catalogActions.setViewGeoFilter());
  }
})

const CollectionFilterMapContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionFilterMap));

export default CollectionFilterMapContainer;
