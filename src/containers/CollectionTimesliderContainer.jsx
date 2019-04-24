import { connect } from 'react-redux';
import { withRouter } from 'react-router';


import CollectionTimeslider from '../components/CollectionTimeslider';
import { collectionTimesliderActions, urlTrackerActions } from '../actions';
import { getCollectionTimesliderRange } from '../selectors/collectionSelectors';

const mapStateToProps = (state) => ({
  collectionTimeslider: state.collectionTimeslider.collectionTimeslider,
  collectionTimesliderRange: getCollectionTimesliderRange(state)
});

const mapDispatchToProps = dispatch => ({
  setCollectionTimeslider: (collectionTimeslider) => {
    dispatch(collectionTimesliderActions.setCollectionTimeslider(collectionTimeslider));
  },
  setUrl: (newUrl, history) => {
    dispatch(urlTrackerActions.setUrl(newUrl, history))
  },
  logFilterChange: (url) => {
    dispatch(urlTrackerActions.logFilterChange(url));
  },
  url404: () => {
    dispatch(urlTrackerActions.url404());
  }
})

const CollectionTimesliderContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionTimeslider));

export default CollectionTimesliderContainer;
