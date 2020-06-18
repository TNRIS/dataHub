import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { geoSearcherActions } from '../actions'
import GeoSearcher from '../components/GeoSearcher'

const mapStateToProps = state => ({
  geoSearcherInputValue: state.geoSearcher.geoSearcherInputValue
})

const mapDispatchToProps = dispatch => ({
  setGeoSearcherInputValue: (geoSearcherInputValue) => {
    dispatch(geoSearcherActions.setGeoSearcherInputValue(geoSearcherInputValue))
  }
})

const CollectionFilterMapContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(GeoSearcher))

export default CollectionFilterMapContainer
