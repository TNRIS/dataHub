import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import {
  catalogActions,
  collectionFilterActions,
  collectionFilterMapActions,
  geoSearcherActions,
  urlTrackerActions
} from '../actions'

import CollectionFilter from '../components/CollectionFilter'
import { getCollectionFilterChoices } from '../selectors/collectionSelectors'

const mapStateToProps = (state) => ({
  collectionFilter: state.collectionFilter.collectionFilter,
  collectionFilterChoices: getCollectionFilterChoices(state),
  collectionFilterMapAoi: state.collectionFilterMap.collectionFilterMapAoi,
  collectionFilterMapFilter:
    state.collectionFilterMap.collectionFilterMapFilter,
  collectionFilterMapSelectedAreaType:
    state.collectionFilterMap.collectionFilterMapSelectedAreaType,
  collectionFilterMapSelectedAreaTypeName:
    state.collectionFilterMap.collectionFilterMapSelectedAreaTypeName,
  geoSearcherInputValue: state.geoSearcher.geoSearcherInputValue,
  view: state.catalog.view
});

const mapDispatchToProps = dispatch => ({
  setCollectionFilter: (collectionFilter) => {
    dispatch(collectionFilterActions.setCollectionFilter(collectionFilter));
  },
  setUrl: (newUrl, history) => {
    dispatch(urlTrackerActions.setUrl(newUrl, history))
  },
  logFilterChange: (url) => {
    dispatch(urlTrackerActions.logFilterChange(url));
  },
  url404: () => {
    dispatch(urlTrackerActions.url404());
  },
  setCollectionFilterMapAoi: (collectionFilterMapAoi) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapAoi(collectionFilterMapAoi));
  },
  setCollectionFilterMapFilter: (collectionFilterMapFilter) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapFilter(collectionFilterMapFilter));
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
  },
  setGeoSearcherInputValue: (geoSearcherInputValue) => {
    dispatch(geoSearcherActions.setGeoSearcherInputValue(geoSearcherInputValue))
  },
  setViewGeoFilter: () => {
    dispatch(catalogActions.setViewGeoFilter());
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  }
})

const CollectionFilterContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionFilter));

export default CollectionFilterContainer;
