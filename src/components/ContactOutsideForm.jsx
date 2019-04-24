import React, { Component } from 'react';
import {MDCTextField} from '@material/textfield';
import {MDCFloatingLabel} from '@material/floating-label';
import {MDCLineRipple} from '@material/line-ripple';
import {MDCRipple} from '@material/ripple';
import {MDCSelect} from '@material/select';
import ReCAPTCHA from "react-google-recaptcha";

class ContactOutsideForm extends Component {

  constructor(props) {
      super(props);
      this.state = {
        firstName: '',
        lastName: '',
        email: '',
        software: '',
        question: '',
        display: 'form',
        recaptcha: '',
        invalid: ''
      }
      this.submitForm = this.submitForm.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.recaptchaChange = this.recaptchaChange.bind(this);
      const collectionYear = this.props.collection.acquisition_date && this.props.collection.template === 'historical-aerial' ? this.props.collection.acquisition_date.substring(0, 4) + ' ' : '';
      this.compiledDisplayName = collectionYear + this.props.collection.name;
  }

  componentDidMount() {
    document.querySelectorAll('.mdc-floating-label').forEach((mdl) => {
      new MDCFloatingLabel(mdl);
    });
    document.querySelectorAll('.mdc-line-ripple').forEach((mlr) => {
      new MDCLineRipple(mlr);
    });
    document.querySelectorAll('.mdc-text-field').forEach((mtf) => {
      new MDCTextField(mtf);
    });
    new MDCRipple(document.querySelector('#contact-tnris-submit'));
    new MDCSelect(document.querySelector('.mdc-select'));
    window.scrollTo(0,0);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.submitStatus === false &&
        nextProps.errorStatus !== null &&
        this.state.display === 'submitting') {
      this.setState({
        display: 'error'
      });
    }
    else if (nextProps.submitStatus === false &&
             nextProps.errorStatus === null &&
             this.state.display === 'submitting') {
      this.setState({
       display: 'success'
      });
    }
  }

  componentWillUnmount () {
    // on umount, dispatch contact success to reset the store
    this.props.submitContactSuccess();
  }

  handleChange(event) {
    const name = event.target.name
    const value = event.target.value
    const nextState = {};
    nextState[name] = value;
    this.setState(nextState);
  }

  recaptchaChange(value) {
    this.setState({
      recaptcha: value
    });
  }

  submitForm (event) {
    event.preventDefault();

    if (this.state.recaptcha !== '') {
      this.setState({
        display: 'submitting',
        invalid: ''
      });
      const fullName = this.state.firstName + " " + this.state.lastName;

      let sendTo = this.props.collection.source_contact;
      let sendMessage = this.state.question;
      if (this.props.collection.source_contact == null || this.props.collection.source_contact === "") {
        sendTo = "support@tnris.supportsystem.com";
        sendMessage = "OUTSIDE ENTITY INQUIRY - BAD SOURCE CONTACT EMAIL - data.tnris.org " + this.state.question;
      }

      const formInfo = {
        'Name': fullName,
        'Email': this.state.email,
        'Category': this.props.collection.category,
        'Software': this.state.software,
        'Message': sendMessage,
        'tnris_link': window.location.protocol + "//" + window.location.host + window.location.pathname,
        'send_to_email': sendTo,
        'send_to_name': this.props.collection.source_name,
        'form_id': 'data-tnris-org-outside-entity',
        'recaptcha': this.state.recaptcha
      };
      this.props.submitContactTnrisForm(formInfo);
    }
    else {
      this.setState({
        invalid: 'Please confirm you are not a robot to proceed.'
      });
    }

  }

  render() {
    let showHTML;

    if (this.state.display === 'form') {
      showHTML = (
        <div>
          <p className="mdc-typography--body2">
            For questions about <strong>{this.compiledDisplayName}</strong> data, please complete the form below.
            Contact submissions through this form are sent directly to the party responsible for the data. <strong>{this.compiledDisplayName}</strong> data
            is not hosted by TNRIS and must be requested through the data owner.
          </p>
          <br></br>

          <div id="ct-first-name" className="mdc-text-field mdc-text-field--outlined">
            <input type="text" id="ct-first-name-input"
                   className="mdc-text-field__input"
                   name="firstName"
                   onChange={this.handleChange}
                   required />
            <label className="mdc-floating-label" htmlFor="ct-first-name-input">First Name</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div id="ct-last-name" className="mdc-text-field mdc-text-field--outlined">
            <input type="text" id="ct-last-name-input"
                   className="mdc-text-field__input"
                   name="lastName"
                   onChange={this.handleChange}
                   required />
            <label className="mdc-floating-label" htmlFor="ct-last-name-input">Last Name</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div id="ct-email" className="mdc-text-field mdc-text-field--outlined">
            <input type="email" id="ct-email-input"
                   className="mdc-text-field__input"
                   name="email"
                   onChange={this.handleChange}
                   required />
            <label className="mdc-floating-label" htmlFor="ct-email-input">Email</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div className="mdc-select">
            <select className="mdc-select__native-control" defaultValue=""
                    name="software"
                    onChange={this.handleChange}
                    required>
              <option value="" disabled></option>
              <option value="ArcMap">ArcMap</option>
              <option value="ENVI">ENVI</option>
              <option value="ERDAS">ERDAS</option>
              <option value="Global Mapper">Global Mapper</option>
              <option value="Integraph">Integraph</option>
              <option value="LP360">LP360</option>
              <option value="Microstation">Microstation</option>
              <option value="PostGIS">PostGIS</option>
              <option value="QGIS">QGIS</option>
              <option value="Other">Other</option>
            </select>
            <label className="mdc-floating-label">Software Being Used</label>
            <div className="mdc-line-ripple"></div>
          </div>


          <div id="ct-question" className="mdc-text-field mdc-text-field--textarea">
            <textarea id="ct-question-input" className="mdc-text-field__input"
                      rows="8" cols="40"
                      name="question"
                      onChange={this.handleChange}
                      required>
            </textarea>
            <label className="mdc-floating-label" htmlFor="ct-question-input">Question or Comment about this dataset...</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <ReCAPTCHA className="recaptcha-container" sitekey="6Lf8GP8SAAAAAFx2H53RtfDO18x7S1q_0pGNdmbd" onChange={this.recaptchaChange} />
          <p className="order-tnris-data-message invalid-prompt">{this.state.invalid}</p>

          <div className="submit-button">
            <input type="submit" value="Submit" id="contact-tnris-submit" className="mdc-button mdc-button--raised"/>
          </div>
        </div>
      );
    }
    else if (this.state.display === 'success') {
      showHTML = (
        <div className="order-tnris-data-message contact-tnris-form-success">
          <p className="mdc-typography--body2">
            <span><strong>Success!</strong></span>
            <br />
            Thank you for submitting your inquiry. Your submission was sent directly to <strong>{this.compiledDisplayName}</strong> and they should respond to you directly via the email address submitted with this form.
          </p>
        </div>
      );
    }
    else if (this.state.display === 'error') {
      showHTML = (
        <div className="order-tnris-data-message contact-tnris-form-error">
          <p className="mdc-typography--body2">
            <span><strong>Error!</strong></span>
            <br />
            Unfortunately, we have encountered an error. Please wait a moment, refresh the page, and try again.
            <br />
            <br />
            {this.props.errorStatus.toString()}
          </p>
        </div>
      );
    }
    else if (this.state.display === 'submitting') {
      showHTML = (
        <div className="order-tnris-data-message contact-tnris-form-submitting">
          <p className="mdc-typography--body2">
            <span><strong>Submitting form...</strong></span>
          </p>
        </div>
      );
    }

    return (
      <form className="contact-tnris-form-component" onSubmit={ this.submitForm }>
        {showHTML}
      </form>
    )
  }
}

export default ContactOutsideForm
