import { connect } from 'react-redux';

import CollectionFilterMapView from '../components/CollectionFilterMapView';

import { catalogActions,
         urlTrackerActions } from '../actions';

const mapStateToProps = state => ({
  previousUrl: state.urlTracker.previousUrl,
  catalogFilterUrl: state.urlTracker.catalogFilterUrl
});

const mapDispatchToProps = dispatch => ({
  setUrl: (newUrl) => {
    dispatch(urlTrackerActions.setUrl(newUrl))
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  }
})

const CollectionFilterMapViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionFilterMapView);

export default CollectionFilterMapViewContainer;
