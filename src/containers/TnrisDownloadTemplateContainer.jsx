import {connect} from 'react-redux'

import TnrisDownloadTemplate from '../components/TnrisDownloadTemplate/TnrisDownloadTemplate'

import {collectionActions} from '../actions'

const mapStateToProps = state => ({
  previousUrl: state.urlTracker.previousUrl
});

const mapDispatchToProps = (dispatch) => ({
  fetchCollectionResources: (collectionId) => {
    dispatch(collectionActions.fetchCollectionResources(collectionId));
  },
  clearSelectedCollection: () => {
    dispatch(collectionActions.clearSelectedCollection());
  },
})

const TnrisDownloadTemplateContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TnrisDownloadTemplate);

export default TnrisDownloadTemplateContainer;
