import { connect } from 'react-redux';

import CollectionFilterMapView from '../components/CollectionFilterMapView';

import { catalogActions,
         collectionFilterMapActions,
         urlTrackerActions } from '../actions';

const mapStateToProps = state => ({
  previousUrl: state.urlTracker.previousUrl,
  catalogFilterUrl: state.urlTracker.catalogFilterUrl,
  collectionFilterMapMoveMap: state.collectionFilterMap.collectionFilterMapMoveMap
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
  }
})

const CollectionFilterMapViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionFilterMapView);

export default CollectionFilterMapViewContainer;
