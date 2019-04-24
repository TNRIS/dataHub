import { connect } from 'react-redux';

import { collectionActions } from '../actions';
import TnrisDownloadTemplate from '../components/TnrisDownloadTemplate/TnrisDownloadTemplate';

const mapStateToProps = state => ({});

const mapDispatchToProps = (dispatch) => ({
    fetchCollectionResources: (collectionId) => {
      dispatch(collectionActions.fetchCollectionResources(collectionId))
    }
})

const TnrisDownloadTemplateContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TnrisDownloadTemplate);

export default TnrisDownloadTemplateContainer;
