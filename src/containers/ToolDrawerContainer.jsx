import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import {
  collectionFilterActions,
  collectionFilterMapActions,
  collectionSorterActions,
  collectionTimesliderActions,
  urlTrackerActions
} from '../actions';
import { getCollectionTimesliderRange } from '../selectors/collectionSelectors';

import ToolDrawer from '../components/ToolDrawer';

const mapStateToProps = (state) => ({
  collectionFilter: state.collectionFilter.collectionFilter,
  collectionFilterMapFilter: state.collectionFilterMap.collectionFilterMapFilter,
  collectionTimesliderRange: getCollectionTimesliderRange(state),
  toolDrawerStatus: state.toolDrawer.toolDrawerStatus,
  toolDrawerVariant: state.toolDrawer.toolDrawerVariant
});

const mapDispatchToProps = dispatch => ({
  sortNew: () => {
    dispatch(collectionSorterActions.setSortNew());
  },
  setCollectionFilter: (collectionFilter) => {
    dispatch(collectionFilterActions.setCollectionFilter(collectionFilter));
  },
  setCollectionFilterMapAoi: (collectionFilterMapAoi) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapAoi(collectionFilterMapAoi));
  },
  setCollectionFilterMapCenter: (collectionFilterMapCenter) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapCenter(collectionFilterMapCenter));
  },
  setCollectionFilterMapFilter: (collectionFilterMapFilter) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapFilter(collectionFilterMapFilter));
  },
  setCollectionFilterMapZoom: (collectionFilterMapZoom) => {
    dispatch(collectionFilterMapActions.setCollectionFilterMapZoom(collectionFilterMapZoom));
  },
  setCollectionTimeslider: (collectionTimeslider) => {
    dispatch(collectionTimesliderActions.setCollectionTimeslider(collectionTimeslider));
  },
  setUrl: (newUrl, history) => {
    dispatch(urlTrackerActions.setUrl(newUrl, history))
  },
  logFilterChange: (url) => {
    dispatch(urlTrackerActions.logFilterChange(url));
  }
})

const ToolDrawerContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolDrawer));

export default ToolDrawerContainer;
