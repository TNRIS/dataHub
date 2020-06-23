import {connect} from 'react-redux'

import { geoSearcherActions } from '../actions'
import {
  getResourceAreas,
  getResourceAreaTypes
} from '../selectors/resourceSelectors'

import TnrisDownloadTemplateDownload from '../components/TnrisDownloadTemplate/TnrisDownloadTemplateDownload'

const mapStateToProps = state => ({
  collectionFilterMapAoi:
    state.collectionFilterMap.collectionFilterMapAoi,
  errorResources: state.collections.errorResources,
  loadingResources: state.collections.loadingResources,
  resourceAreas: getResourceAreas(state),
  resourceAreaTypes: getResourceAreaTypes(state),
  selectedCollectionResources: state.collections.selectedCollectionResources,
  theme: state.colorTheme.theme
});

const mapDispatchToProps = (dispatch) => ({
  setGeoSearcherInputValue: (geoSearcherInputValue) => {
    dispatch(
      geoSearcherActions.setGeoSearcherInputValue(geoSearcherInputValue)
    );
  }
})

const TnrisDownloadTemplateDownloadContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TnrisDownloadTemplateDownload);

export default TnrisDownloadTemplateDownloadContainer;
