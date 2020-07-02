import {connect} from 'react-redux'

import BackButton from '../components/DialogTemplateListItems/BackButton'

import {catalogActions,
        collectionActions,
        urlTrackerActions} from '../actions'

const mapStateToProps = state => ({
  previousUrl: state.urlTracker.previousUrl,
  catalogFilterUrl: state.urlTracker.catalogFilterUrl,
  view: state.catalog.view
});

const mapDispatchToProps = (dispatch) => ({
  setUrl: (newUrl) => {
    dispatch(urlTrackerActions.setUrl(newUrl));
  },
  setViewCatalog: () => {
    dispatch(catalogActions.setViewCatalog());
  },
  setViewCollection: () => {
    dispatch(catalogActions.setViewCollection());
  },
  selectCollection: (collectionId) => {
    dispatch(collectionActions.selectCollection(collectionId));
  },
})

const BackButtonContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BackButton);

export default BackButtonContainer;
