import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import {
  catalogActions,
  collectionFilterActions,
  collectionFilterMapActions,
  urlTrackerActions
} from '../actions';
import CollectionFilter from '../components/CollectionFilter';
import { getCollectionFilterChoices } from '../selectors/collectionSelectors';

const mapStateToProps = (state) => ({
  collectionFilter: state.collectionFilter.collectionFilter,
  collectionFilterChoices: getCollectionFilterChoices(state),
  collectionFilterMapFilter: state.collectionFilterMap.collectionFilterMapFilter,
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
