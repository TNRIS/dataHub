import { connect } from 'react-redux'

import CollectionFilterMapView from '../components/CollectionFilterMapView'

import { catalogActions,
         collectionFilterMapActions,
         urlTrackerActions } from '../actions';

const mapStateToProps = state => ({
  previousUrl:
    state.urlTracker.previousUrl,
  catalogFilterUrl:
    state.urlTracker.catalogFilterUrl,
  collectionFilterMapFilter:
    state.collectionFilterMap.collectionFilterMapFilter
});

const mapDispatchToProps = dispatch => ({
  setUrl: (newUrl) => {
    dispatch(urlTrackerActions.setUrl(newUrl))
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  },
  setCollectionFilterMapCenter: (collectionFilterMapCenter) => {
    dispatch(
      collectionFilterMapActions.setCollectionFilterMapCenter(
        collectionFilterMapCenter
      )
    );
  },
  setCollectionFilterMapZoom: (collectionFilterMapZoom) => {
    dispatch(
      collectionFilterMapActions.setCollectionFilterMapZoom(
        collectionFilterMapZoom
      )
    );
  },
  setCollectionFilterMapAoi: (collectionFilterMapAoi) => {
    dispatch(
      collectionFilterMapActions.setCollectionFilterMapAoi(
        collectionFilterMapAoi
      )
    );
  }
})

const CollectionFilterMapViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionFilterMapView);

export default CollectionFilterMapViewContainer;
