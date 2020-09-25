import {connect} from 'react-redux'

import BackButton from '../components/DialogTemplateListItems/BackButton'

import {catalogActions,
  collectionActions,
  urlTrackerActions,
} from '../actions'

import {
  getAllCollections
} from '../selectors/collectionSelectors'

const mapStateToProps = state => ({
  previousUrl: state.urlTracker.previousUrl,
  catalogFilterUrl: state.urlTracker.catalogFilterUrl,
  view: state.catalog.view,
  selectedCollection: state.collections.selectedCollection,
  collections: getAllCollections(state)
});

const mapDispatchToProps = (dispatch) => ({
  setUrl: (newUrl) => {
    dispatch(urlTrackerActions.setUrl(newUrl));
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  },
  setViewCollection: () => {
    dispatch(catalogActions.setViewCollection());
  },
  selectCollection: (collectionId) => {
    dispatch(collectionActions.selectCollection(collectionId));
  },
})

const BackButtonContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BackButton);

export default BackButtonContainer;
