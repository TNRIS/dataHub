import { connect } from 'react-redux';
import { getResourceAreas,
         getResourceAreaTypes
       } from '../selectors/resourceSelectors';
import TnrisOrderTemplateOrder from '../components/TnrisOrderTemplate/TnrisOrderTemplateOrder';
// import OrderTnrisDataForm from '../components/OrderTnrisDataForm';

const mapStateToProps = state => ({
  loadingResources: state.collections.loadingResources,
  errorResources: state.collections.errorResources,
  selectedCollectionResources: state.collections.selectedCollectionResources,
  resourceAreas: getResourceAreas(state),
  resourceAreaTypes: getResourceAreaTypes(state)
});

const mapDispatchToProps = (dispatch) => ({

})

const TnrisOrderTemplateOrderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TnrisOrderTemplateOrder);

export default TnrisOrderTemplateOrderContainer;
