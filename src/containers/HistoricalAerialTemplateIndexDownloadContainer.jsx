import {connect} from 'react-redux'

import HistoricalAerialTemplateIndexDownload from '../components/HistoricalAerialTemplate/HistoricalAerialTemplateIndexDownload'

const mapStateToProps = state => ({
  theme: state.colorTheme.theme
});

const mapDispatchToProps = (dispatch) => ({

})

const HistoricalAerialTemplateIndexDownloadContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(HistoricalAerialTemplateIndexDownload);

export default HistoricalAerialTemplateIndexDownloadContainer;
