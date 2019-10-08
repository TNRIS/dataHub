import { connect } from 'react-redux';

import CollectionFilterMapView from '../components/CollectionFilterMapView';

import { catalogActions,
         collectionFilterMapActions,
         urlTrackerActions } from '../actions';

const mapStateToProps = state => ({
  previousUrl:
    state.urlTracker.previousUrl,
  catalogFilterUrl:
    state.urlTracker.catalogFilterUrl,
  collectionFilterMapMoveMap:
    state.collectionFilterMap.collectionFilterMapMoveMap,
  collectionFilterMapSelectedAreaType:
    state.collectionFilterMap.collectionFilterMapSelectedAreaType,
  collectionFilterMapSelectedAreaTypeName:
    state.collectionFilterMap.collectionFilterMapSelectedAreaTypeName
});

const mapDispatchToProps = dispatch => ({
  setUrl: (newUrl) => {
    dispatch(urlTrackerActions.setUrl(newUrl))
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  },
  setCollectionFilterMapMoveMap: (collectionFilterMapMoveMap) => {
    dispatch(
      collectionFilterMapActions.setCollectionFilterMapMoveMap(
        collectionFilterMapMoveMap
      )
    );
  },
  setCollectionFilterMapCenter: (collectionFilterMapCenter) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapCenter(collectionFilterMapCenter));
  },
  setCollectionFilterMapZoom: (collectionFilterMapZoom) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapZoom(collectionFilterMapZoom));
  },
  setCollectionFilterMapAoi: (collectionFilterMapAoi) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapAoi(collectionFilterMapAoi));
  },
  setCollectionFilterMapSelectedAreaType: (collectionFilterMapSelectedAreaType) => {
    dispatch(
      collectionFilterMapActions.setCollectionFilterMapSelectedAreaType(
        collectionFilterMapSelectedAreaType
      )
    );
  },
  setCollectionFilterMapSelectedAreaTypeName: (collectionFilterMapSelectedAreaTypeName) => {
    dispatch(
      collectionFilterMapActions.setCollectionFilterMapSelectedAreaTypeName(
        collectionFilterMapSelectedAreaTypeName
      )
    );
  }
})

const CollectionFilterMapViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionFilterMapView);

export default CollectionFilterMapViewContainer;
