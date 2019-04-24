import { connect } from 'react-redux';

import { contactActions } from '../actions';
import ContactTnrisForm from '../components/ContactTnrisForm';

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

const ContactContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactTnrisForm);

export default ContactContainer;
