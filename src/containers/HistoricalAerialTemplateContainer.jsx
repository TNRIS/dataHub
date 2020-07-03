import {connect} from 'react-redux'

import HistoricalAerialTemplate from '../components/HistoricalAerialTemplate/HistoricalAerialTemplate'

import {collectionActions} from '../actions'

const mapStateToProps = state => ({
  previousUrl: state.urlTracker.previousUrl
});

const mapDispatchToProps = (dispatch) => ({
  clearSelectedCollection: () => {
    dispatch(collectionActions.clearSelectedCollection());
  },
})

const HistoricalAerialTemplateContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(HistoricalAerialTemplate);

export default HistoricalAerialTemplateContainer;
