import { connect } from 'react-redux';

import CountyCoverage from '../components/DialogTemplateListItems/CountyCoverage';

const mapStateToProps = state => ({
  theme: state.colorTheme.theme
});

const mapDispatchToProps = dispatch => ({
})

const CountyCoverageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CountyCoverage);

export default CountyCoverageContainer;
