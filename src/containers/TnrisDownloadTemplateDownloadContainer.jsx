import { connect } from 'react-redux';
import { getResourceAreas,
         getResourceAreaTypes
       } from '../selectors/resourceSelectors';
import TnrisDownloadTemplateDownload from '../components/TnrisDownloadTemplate/TnrisDownloadTemplateDownload';

const mapStateToProps = state => ({
  loadingResources: state.collections.loadingResources,
  errorResources: state.collections.errorResources,
  selectedCollectionResources: state.collections.selectedCollectionResources,
  resourceAreas: getResourceAreas(state),
  resourceAreaTypes: getResourceAreaTypes(state),
  theme: state.colorTheme.theme
});

const mapDispatchToProps = (dispatch) => ({

})

const TnrisDownloadTemplateDownloadContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TnrisDownloadTemplateDownload);

export default TnrisDownloadTemplateDownloadContainer;
