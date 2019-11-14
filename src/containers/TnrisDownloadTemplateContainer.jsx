import {connect} from 'react-redux'

import TnrisDownloadTemplate from '../components/TnrisDownloadTemplate/TnrisDownloadTemplate'

import {catalogActions,
        collectionActions,
        urlTrackerActions} from '../actions'

const mapStateToProps = state => ({
  previousUrl: state.urlTracker.previousUrl
});

const mapDispatchToProps = (dispatch) => ({
  fetchCollectionResources: (collectionId) => {
    dispatch(collectionActions.fetchCollectionResources(collectionId))
  },
  setUrl: (newUrl) => {
    dispatch(urlTrackerActions.setUrl(newUrl))
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

const TnrisDownloadTemplateContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TnrisDownloadTemplate);

export default TnrisDownloadTemplateContainer;
