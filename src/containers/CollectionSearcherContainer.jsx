import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import CollectionSearcher from '../components/CollectionSearcher';
import {
  catalogActions,
  collectionActions,
  collectionSearcherActions,
  urlTrackerActions,
  colorThemeActions
} from '../actions';
import {
  getAllCollections,
  getSearchSuggestions
} from '../selectors/collectionSelectors';

const mapStateToProps = (state) => ({
  collections: getAllCollections(state),
  collectionSearchQuery: state.collectionSearcher.collectionSearchQuery,
  collectionSearchSuggestions: getSearchSuggestions(state),
  collectionSearchSuggestionsQuery: state.collectionSearcher.collectionSearchSuggestionsQuery,
  view: state.catalog.view,
  previousUrl: state.urlTracker.previousUrl,
  selectedCollection: state.collections.selectedCollection
});

const mapDispatchToProps = dispatch => ({
  clearSelectedCollection: () => {
    dispatch(collectionActions.clearSelectedCollection());
  },
  setCollectionSearchQuery: (collectionSearchQuery) => {
    dispatch(collectionSearcherActions.setCollectionSearchQuery(collectionSearchQuery));
  },
  setCollectionSearchSuggestionsQuery: (collectionSearchSuggestionsQuery) => {
    dispatch(collectionSearcherActions.setCollectionSearchSuggestionsQuery(collectionSearchSuggestionsQuery));
  },
  setUrl: (newUrl, history) => {
    dispatch(urlTrackerActions.setUrl(newUrl, history));
  },
  logFilterChange: (url) => {
    dispatch(urlTrackerActions.logFilterChange(url));
  },
  url404: () => {
    dispatch(urlTrackerActions.url404());
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  },
  setColorTheme: (theme) => {
    dispatch(colorThemeActions.setColorTheme(theme));
  }
})

const CollectionSearcherContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionSearcher));

export default CollectionSearcherContainer;
