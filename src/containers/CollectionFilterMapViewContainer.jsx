import { connect } from 'react-redux';

import CollectionFilterMapView from '../components/CollectionFilterMapView';

import { catalogActions,
         collectionFilterMapActions,
         urlTrackerActions } from '../actions';

const mapStateToProps = state => ({
  previousUrl: state.urlTracker.previousUrl,
  catalogFilterUrl: state.urlTracker.catalogFilterUrl,
  collectionFilterMapMoveMap: state.collectionFilterMap.collectionFilterMapMoveMap,
  collectionFilterMapSelectedCountyName: state.collectionFilterMap.collectionFilterMapSelectedCountyName
});

const mapDispatchToProps = dispatch => ({
  setUrl: (newUrl) => {
    dispatch(urlTrackerActions.setUrl(newUrl))
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  },
  setCollectionFilterMapMoveMap: (collectionFilterMapMoveMap) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapMoveMap(collectionFilterMapMoveMap));
  },
  setCollectionFilterMapSelectedCountyName: (collectionFilterMapSelectedCountyName) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapSelectedCountyName(collectionFilterMapSelectedCountyName));
  }
})

const CollectionFilterMapViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionFilterMapView);

export default CollectionFilterMapViewContainer;
