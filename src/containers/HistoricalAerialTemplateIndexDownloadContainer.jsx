import {connect} from 'react-redux'

import { geoSearcherActions } from '../actions'

import HistoricalAerialTemplateIndexDownload from '../components/HistoricalAerialTemplate/HistoricalAerialTemplateIndexDownload'

const mapStateToProps = state => ({
  collectionFilterMapAoi:
    state.collectionFilterMap.collectionFilterMapAoi,
  theme: state.colorTheme.theme
});

const mapDispatchToProps = (dispatch) => ({
  setGeoSearcherInputValue: (geoSearcherInputValue) => {
    dispatch(
      geoSearcherActions.setGeoSearcherInputValue(geoSearcherInputValue)
    );
  }
})

const HistoricalAerialTemplateIndexDownloadContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(HistoricalAerialTemplateIndexDownload);

export default HistoricalAerialTemplateIndexDownloadContainer;
