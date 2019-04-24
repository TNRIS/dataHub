import { connect } from 'react-redux';

import { contactActions } from '../actions';
import ContactOutsideForm from '../components/ContactOutsideForm';

const mapStateToProps = state => ({
  submitStatus: state.contact.submitting,
  errorStatus: state.contact.error
});

const mapDispatchToProps = dispatch => ({
  submitContactSuccess: () => {
    dispatch(contactActions.submitContactSuccess());
  },
  submitContactTnrisForm: (formInfo) => {
    dispatch(contactActions.submitContactTnrisForm(formInfo));
  }
})

const ContactOutsideContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactOutsideForm);

export default ContactOutsideContainer;
