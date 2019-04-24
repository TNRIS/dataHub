import React, { Component } from 'react';
import {MDCTextField} from '@material/textfield';
import {MDCFloatingLabel} from '@material/floating-label';
import {MDCLineRipple} from '@material/line-ripple';
import {MDCRipple} from '@material/ripple';
import {MDCSelect} from '@material/select';
import ReCAPTCHA from "react-google-recaptcha";

class OrderCart extends Component {

  constructor(props) {
      super(props);
      // form fields go in state to monitor changes
      this.state = {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: 'TX',
        zipcode: '',
        phone: '',
        email: '',
        organization: '',
        industry: '',
        delivery: '',
        hardDrive: '',
        payment: '',
        notes: '',
        display: 'form',
        recaptcha: '',
        invalid: ''
      }
      this.submitForm = this.submitForm.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.recaptchaChange = this.recaptchaChange.bind(this);
      this.handleKeyRemoval = this.handleKeyRemoval.bind(this);
      this.handleCartItemClick = this.handleCartItemClick.bind(this);
  }

  componentDidMount() {
    // create Material form objects
    document.querySelectorAll('.mdc-floating-label').forEach((mdl) => {
      new MDCFloatingLabel(mdl);
    });
    document.querySelectorAll('.mdc-line-ripple').forEach((mlr) => {
      new MDCLineRipple(mlr);
    });
    document.querySelectorAll('.mdc-text-field').forEach((mtf) => {
      new MDCTextField(mtf);
    });
    document.querySelectorAll('.mdc-select').forEach((ms) => {
      new MDCSelect(ms);
    });
    document.querySelectorAll('.mdc-button').forEach((mb) => {
      new MDCRipple(mb);
    });
  }

  componentWillUpdate(nextProps) {
    // change display based on lifecycle of submitting order
    if (nextProps.submitting === false &&
        nextProps.submitError !== null &&
        this.state.display === 'submitting') {
      this.setState({
        display: 'error'
      });
    }
    else if (nextProps.submitting === false &&
             nextProps.submitError === null &&
             this.state.display === 'submitting') {
      this.setState({
       display: 'success'
      });
    }
    else if (this.state.display === 'success' && Object.keys(nextProps.orders).length !== 0) {
      this.setState({
        display: 'form'
      });
    }
  }

  componentDidUpdate() {
    // if showing the form and datasets present in cart then adjust form inputs
    if (this.state.display === 'form' && Object.keys(this.props.orders).length !== 0) {
      document.querySelectorAll('.mdc-floating-label').forEach((mdl) => {
        new MDCFloatingLabel(mdl);
      });
      document.querySelectorAll('.mdc-line-ripple').forEach((mlr) => {
        new MDCLineRipple(mlr);
      });
      document.querySelectorAll('.mdc-text-field').forEach((mtf) => {
        new MDCTextField(mtf);
      });
      document.querySelectorAll('.mdc-select').forEach((ms) => {
        new MDCSelect(ms);
      });
      document.querySelectorAll('.mdc-button').forEach((mb) => {
        new MDCRipple(mb);
      });

      if (this.state.industry !== '' && this.state.industry !== 'No Industry') {
        document.getElementById("order-cart-organization-input").required = true;
      }
      else {
        document.getElementById("order-cart-organization-input").required = false;
      }

      if (this.state.delivery !== '' && this.state.delivery !== 'Zipfile Download') {
        document.getElementsByName("hardDrive").forEach((input) => {
          input.required = true;
        });
      }
      else {
        document.getElementsByName("hardDrive").forEach((input) => {
          input.required = false;
          input.checked = false;
        });
      }

      if (this.state.delivery === 'Fedex') {
        document.getElementById("payment-fedex-input").disabled = false;
      }
      else {
        document.getElementById("payment-fedex-input").disabled = true;
        document.getElementById("payment-fedex-input").checked = false;
      }

      if (this.state.delivery === 'Pickup') {
        document.getElementById("payment-pickup-input").disabled = false;
      }
      else {
        document.getElementById("payment-pickup-input").disabled = true;
        document.getElementById("payment-pickup-input").checked = false;
      }
    }
  }

  handleChange(event) {
    // on form field change, update state
    const name = event.target.name
    const value = event.target.value
    const nextState = {};
    nextState[name] = value;
    if (name === 'delivery' && value === 'Zipfile Download') {
      nextState['hardDrive'] = "";
    }
    if (name === 'delivery' && value !== 'Fedex' && this.state.payment === 'Fedex Customer Account') {
      nextState['payment'] = "";
    }
    if (name === 'delivery' && value !== 'Pickup' && this.state.payment === 'Pay at Pickup') {
      nextState['payment'] = "";
    }
    this.setState(nextState);
  }

  recaptchaChange(value) {
    this.setState({
      recaptcha: value
    });
  }

  submitForm (event) {
    event.preventDefault();
    // if the recaptcha hasn't been verified, invalidate the form
    if (this.state.recaptcha === '') {
      this.setState({
        invalid: 'Please confirm you are not a robot to proceed.'
      });
      return;
    }
    // as long as there are orders in the cart, attempt to submit
    if (Object.keys(this.props.orders).length !== 0) {
      this.setState({
        display: 'submitting',
        invalid: ''
      });
      // format name and address for pretty ticket
      const fullName = this.state.firstName + " " + this.state.lastName;
      const address = this.state.address + " " + this.state.city + ", " + this.state.state + " " + this.state.zipcode;
      // format dataset details in order for pretty ticket
      let orders = "\n";
      Object.keys(this.props.orders).map((collectionId, index) => {
        const dataName = this.props.collections[collectionId].name;
        const dataNum = `(${index + 1}) ${dataName}`;
        orders += dataNum;
        orders += "\n";
        orders += `   UUID: ${collectionId}\n`;
        const dataDate = this.props.collections[collectionId].acquisition_date;
        orders += `   Acquisition Date: ${dataDate}\n`;
        const dataOrder = this.props.orders[collectionId];
        orders += `   Coverage: ${dataOrder.coverage}\n`;
        if (dataOrder.formats) {orders += `   Formats: ${dataOrder.formats}\n`;}
        if (dataOrder.coverage === 'Partial') {orders += `   Identified By: ${dataOrder.type}\n`;}
        if (dataOrder.description) {orders += `   Description: ${dataOrder.description}\n`;}
        if (dataOrder.attachments) {
          orders += `   Attachments:\n`
          Object.keys(dataOrder.attachments).map(num => {
            const attNumber = Number(num) + 1;
            const att = dataOrder.attachments[num];
            orders += `       #${attNumber} - ${att.filename}`;
            orders += `       ${att.link}\n`;
            return true;
          });
        }
        return true;
      });
      // create object of all form information and submit
      const formInfo = {
        'Name': fullName,
        'Address': address,
        'Phone': this.state.phone,
        'Email': this.state.email,
        'Industry': this.state.industry,
        'Organization': this.state.organization,
        'Delivery': this.state.delivery,
        'HardDrive': this.state.hardDrive,
        'Payment': this.state.payment,
        'Notes': this.state.notes,
        'Order': orders,
        'form_id': 'data-tnris-org-order',
        'recaptcha': this.state.recaptcha
      };
      this.props.submitOrderCartForm(formInfo);
    }
    else {
      this.setState({
        invalid: 'The shopping cart is empty. You cannot order no data.'
      });
      return;
    }

  }

  handleKeyRemoval (e, collectionId) {
    if (e.keyCode === 13 || e.keyCode === 32) {
      this.props.removeCollectionFromCart(collectionId);
    }
  }

  handleCartItemClick(e) {
    this.props.setViewCollection();
    this.props.selectCollection(e.target.name);
    this.props.setUrl('/collection/' + e.target.name);
  }

  render() {
    // default filler for empty cart
    let showHTML = (
      <div className="default-order-cart-display"></div>
    );
    // toggle classes of inputs based on other form field selections
    const orgClass = this.state.industry !== '' && this.state.industry !== 'No Industry' ? "mdc-text-field mdc-text-field--outlined" : "mdc-text-field mdc-text-field--outlined hidden-field";
    const hdClass = this.state.delivery !== '' && this.state.delivery !== 'Zipfile Download' ? "hard-drive-field" : "hidden-field";
    const zipfileDownloadLidarBlurb = this.state.delivery === 'Zipfile Download' ? <div className='mdc-typography--caption'><strong>Note:</strong> Lidar datasets are often very large, and TNRIS cannot offer digital downloads for datasets larger than 10 GB. If the ordered dataset is larger than 10 GB, you have the option of either providing a factory-sealed external hard drive (or multiple factory-sealed external hard drives) or purchasing them at cost from TNRIS.</div> : "";
    // empty cart html
    const emptyCartMessage = (
      <ul className="mdc-list empty-cart-message">
        <li><strong>There are no datasets in your cart.</strong></li>
        <li>Although only some datasets are available for download, all datasets are available for ordering directly from TNRIS. To order a dataset(s), click the Catalog icon above, open a dataset card, and choose the Order tab in the top right.</li>
      </ul>
    );
    // if cart not empty, iterate datasets and display their order details,
    // otherwise show emptyCartMessage
    const cartItems = Object.keys(this.props.orders).length !== 0 && this.state.display === 'form'?
      Object.keys(this.props.orders).map(collectionId => {
        const collectionYear = this.props.collections[collectionId].acquisition_date ? this.props.collections[collectionId].acquisition_date.substring(0, 4) + ' ' : '';
        const compiledDisplayName = collectionYear + this.props.collections[collectionId].name;
        const partialType = this.props.orders[collectionId].type ? `, ${this.props.orders[collectionId].type}` : "";
        const attachmentNum = this.props.orders[collectionId].attachments ? Object.keys(this.props.orders[collectionId].attachments).length : "";
        const attachments = this.props.orders[collectionId].attachments ? `, ${attachmentNum} attachment(s)`: "";
        const formats = this.props.orders[collectionId].formats ? `, Formats: ${this.props.orders[collectionId].formats}` : "";

        return (
          <li key={collectionId} className="mdc-list-item">
            <span className="mdc-list-item__graphic material-icons" aria-hidden="true">whatshot</span>
            <span className="mdc-list-item__text">
              <span className="mdc-list-item__primary-text"><a name={collectionId} onClick={this.handleCartItemClick}>{compiledDisplayName}</a></span>
              <span className="mdc-list-item__secondary-text">{this.props.orders[collectionId].coverage} Coverage{partialType}{attachments}{formats}</span>
            </span>
            <span className="mdc-list-item__meta material-icons"
                  aria-hidden="true"
                  title="Remove from Shopping Cart"
                  onClick={() => this.props.removeCollectionFromCart(collectionId)}
                  onKeyDown={(e) => this.handleKeyRemoval(e, collectionId)}
                  tabIndex="0">remove_circle</span>
          </li>
        );
      }) : emptyCartMessage;
      // if cart not empty and form not submitting/submitted, show form itself
    if (this.state.display === 'form' && Object.keys(this.props.orders).length !== 0) {
      showHTML = (
        <div className="template-content-div">
          <p className="mdc-typography--body1">
            Complete the form below to finalize and submit your data order...
          </p>

          <div className='mdc-typography--headline6'>
            Requestor Details
          </div>
          <div id="order-cart-first-name" className="mdc-text-field mdc-text-field--outlined">
            <input type="text" id="order-cart-first-name-input"
                   className="mdc-text-field__input"
                   name="firstName"
                   title="First Name"
                   onChange={this.handleChange}
                   tabIndex="0"
                   required />
            <label className="mdc-floating-label" htmlFor="order-cart-first-name-input">First Name</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div id="order-cart-last-name" className="mdc-text-field mdc-text-field--outlined">
            <input type="text" id="order-cart-last-name-input"
                   className="mdc-text-field__input"
                   name="lastName"
                   title="Last Name"
                   onChange={this.handleChange}
                   tabIndex="0"
                   required />
            <label className="mdc-floating-label" htmlFor="order-cart-last-name-input">Last Name</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div id="order-cart-address" className="mdc-text-field mdc-text-field--outlined">
            <input type="text" id="order-cart-address-input"
                   className="mdc-text-field__input"
                   name="address"
                   title="Mailing address number and street name"
                   onChange={this.handleChange}
                   tabIndex="0"
                   required />
                 <label className="mdc-floating-label" htmlFor="order-cart-address-input">Address</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div id="order-cart-city" className="mdc-text-field mdc-text-field--outlined">
            <input type="text" id="order-cart-city-input"
                   className="mdc-text-field__input"
                   name="city"
                   title="Mailing address city"
                   onChange={this.handleChange}
                   tabIndex="0"
                   required />
                 <label className="mdc-floating-label" htmlFor="order-cart-city-input">City</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div className="mdc-select">
            <select className="mdc-select__native-control" defaultValue="TX"
                    name="state"
                    title="Mailing address state"
                    onChange={this.handleChange}
                    tabIndex="0"
                    required>
              <option value="AL">Alabama</option>
            	<option value="AK">Alaska</option>
            	<option value="AZ">Arizona</option>
            	<option value="AR">Arkansas</option>
            	<option value="CA">California</option>
            	<option value="CO">Colorado</option>
            	<option value="CT">Connecticut</option>
            	<option value="DE">Delaware</option>
            	<option value="DC">District Of Columbia</option>
            	<option value="FL">Florida</option>
            	<option value="GA">Georgia</option>
            	<option value="HI">Hawaii</option>
            	<option value="ID">Idaho</option>
            	<option value="IL">Illinois</option>
            	<option value="IN">Indiana</option>
            	<option value="IA">Iowa</option>
            	<option value="KS">Kansas</option>
            	<option value="KY">Kentucky</option>
            	<option value="LA">Louisiana</option>
            	<option value="ME">Maine</option>
            	<option value="MD">Maryland</option>
            	<option value="MA">Massachusetts</option>
            	<option value="MI">Michigan</option>
            	<option value="MN">Minnesota</option>
            	<option value="MS">Mississippi</option>
            	<option value="MO">Missouri</option>
            	<option value="MT">Montana</option>
            	<option value="NE">Nebraska</option>
            	<option value="NV">Nevada</option>
            	<option value="NH">New Hampshire</option>
            	<option value="NJ">New Jersey</option>
            	<option value="NM">New Mexico</option>
            	<option value="NY">New York</option>
            	<option value="NC">North Carolina</option>
            	<option value="ND">North Dakota</option>
            	<option value="OH">Ohio</option>
            	<option value="OK">Oklahoma</option>
            	<option value="OR">Oregon</option>
            	<option value="PA">Pennsylvania</option>
            	<option value="RI">Rhode Island</option>
            	<option value="SC">South Carolina</option>
            	<option value="SD">South Dakota</option>
            	<option value="TN">Tennessee</option>
            	<option value="TX">Texas</option>
            	<option value="UT">Utah</option>
            	<option value="VT">Vermont</option>
            	<option value="VA">Virginia</option>
            	<option value="WA">Washington</option>
            	<option value="WV">West Virginia</option>
            	<option value="WI">Wisconsin</option>
            	<option value="WY">Wyoming</option>
            </select>
            <label className="mdc-floating-label">State</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div id="order-cart-zipcode" className="mdc-text-field mdc-text-field--outlined">
            <input type="number" id="order-cart-zipcode-input"
                   className="mdc-text-field__input"
                   name="zipcode"
                   pattern="[0-9]{5}"
                   title="5 digit numerical zipcode"
                   onChange={this.handleChange}
                   tabIndex="0"
                   required />
                 <label className="mdc-floating-label" htmlFor="order-cart-zipcode-input">Zipcode</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div id="order-cart-phone" className="mdc-text-field mdc-text-field--outlined">
            <input type="tel" id="order-cart-phone-input"
                   className="mdc-text-field__input"
                   name="phone"
                   pattern="[0-9]{10}"
                   title="10 digit numerical phone number with no separator characters"
                   onChange={this.handleChange}
                   tabIndex="0"
                   required />
                 <label className="mdc-floating-label" htmlFor="order-cart-phone-input">Phone Number</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div id="order-cart-email" className="mdc-text-field mdc-text-field--outlined">
            <input type="email" id="order-cart-email-input"
                   className="mdc-text-field__input"
                   name="email"
                   title="Valid email address. e.g. crockett@miamivice.com"
                   onChange={this.handleChange}
                   tabIndex="0"
                   required />
            <label className="mdc-floating-label" htmlFor="order-cart-email-input">Email</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div className="mdc-select">
            <select className="mdc-select__native-control" defaultValue=""
                    name="industry"
                    title="Please choose your industry from the dropdown"
                    onChange={this.handleChange}
                    tabIndex="0"
                    required>
              <option value="" disabled></option>
              <option value="No Industry" label="No Industry (Personal Order)">No Industry (Personal Order)</option>
              <option value="Agriculture" label="Agriculture">Agriculture</option>
              <option value="Cartography" label="Cartography">Cartography</option>
              <option value="Conservation" label="Conservation">Conservation</option>
              <option value="Construction" label="Construction">Construction</option>
              <option value="Consulting" label="Consulting">Consulting</option>
              <option value="Education" label="Education">Education</option>
              <option value="Emergency Management" label="Emergency Management">Emergency Management</option>
              <option value="Environmental" label="Environmental">Environmental</option>
              <option value="Forestry" label="Forestry">Forestry</option>
              <option value="Government" label="Government">Government</option>
              <option value="Insurance" label="Insurance">Insurance</option>
              <option value="Law Enforcement" label="Law Enforcement">Law Enforcement</option>
              <option value="Oil and Gas" label="Oil and Gas">Oil and Gas</option>
              <option value="Public Health" label="Public Health">Public Health</option>
              <option value="Retail" label="Retail">Retail</option>
              <option value="Utilities" label="Utilities">Utilities</option>
              <option value="Urban Planning" label="Urban Planning">Urban Planning</option>
              <option value="Other" label="Other">Other</option>
            </select>
            <label className="mdc-floating-label">Industry</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div id="order-cart-organization" className={orgClass}>
            <input type="text" id="order-cart-organization-input"
                   className="mdc-text-field__input"
                   name="organization"
                   defaultValue=""
                   title="Organization name"
                   onChange={this.handleChange}
                   tabIndex="0" />
                 <label className="mdc-floating-label" htmlFor="order-cart-organization-input">Organization</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div className="mdc-text-field mdc-text-field--textarea">
            <textarea className="mdc-text-field__input"
                      rows="3"
                      name="notes"
                      onChange={this.handleChange}
                      tabIndex="0">
            </textarea>
            <label className="mdc-floating-label" htmlFor="ct-question-input">General notes or comments about this order...</label>
            <div className="mdc-line-ripple"></div>
          </div>

          <div className='mdc-typography--headline6'>
            Delivery Method*
          </div>
          <div className='mdc-typography--body2'>Listed shipping costs assume TNRIS provided hard drive. This price will vary if delivered on customer supplied hard drive.</div>
          <div id="delivery-zipfile" className="mdc-form-field">
            <div className="mdc-radio">
              <input className="mdc-radio__native-control"
                type="radio"
                id="delivery-zipfile-input"
                name="delivery"
                value="Zipfile Download"
                onChange={this.handleChange}
                tabIndex="0"
                required />
              <div className="mdc-radio__background">
                <div className="mdc-radio__outer-circle"></div>
                <div className="mdc-radio__inner-circle"></div>
              </div>
            </div>
            <label htmlFor="delivery-zipfile-input">Prepared Zipfile Download (Free, 10 GB Max)</label>
          </div>
          {zipfileDownloadLidarBlurb}
          <div id="delivery-usps" className="mdc-form-field">
            <div className="mdc-radio">
              <input className="mdc-radio__native-control"
                     type="radio"
                     id="delivery-usps-input"
                     name="delivery"
                     value="USPS"
                     onChange={this.handleChange}
                     tabIndex="0" />
              <div className="mdc-radio__background">
                <div className="mdc-radio__outer-circle"></div>
                <div className="mdc-radio__inner-circle"></div>
              </div>
            </div>
            <label htmlFor="delivery-usps-input">USPS ($5 per hard drive)</label>
          </div>
          <div id="delivery-fedex" className="mdc-form-field">
            <div className="mdc-radio">
              <input className="mdc-radio__native-control"
                     type="radio"
                     id="delivery-fedex-input"
                     name="delivery"
                     value="Fedex"
                     onChange={this.handleChange}
                     tabIndex="0" />
              <div className="mdc-radio__background">
                <div className="mdc-radio__outer-circle"></div>
                <div className="mdc-radio__inner-circle"></div>
              </div>
            </div>
            <label htmlFor="delivery-fedex-input">Fedex ($15 per hard drive)</label>
          </div>
          <div className='mdc-typography--caption'>Direct Fedex customer account number charging available.</div>
          <div id="delivery-pickup" className="mdc-form-field">
            <div className="mdc-radio">
              <input className="mdc-radio__native-control"
                     type="radio"
                     id="delivery-pickup-input"
                     name="delivery"
                     value="Pickup"
                     onChange={this.handleChange}
                     tabIndex="0" />
              <div className="mdc-radio__background">
                <div className="mdc-radio__outer-circle"></div>
                <div className="mdc-radio__inner-circle"></div>
              </div>
            </div>
            <label htmlFor="delivery-pickup-input">Pickup</label>
          </div>

          <div className={hdClass}>
            <div className='mdc-typography--headline6'>
              Hard Drive*
            </div>
            <div className='mdc-typography--body2'>If TNRIS provided drive is selected, the final total will include purchase cost of the drive.</div>
            <div id="hard-drive-tnris-hd" className="mdc-form-field">
              <div className="mdc-radio">
                <input className="mdc-radio__native-control"
                       type="radio"
                       id="hard-drive-tnris-hd-input"
                       name="hardDrive"
                       value="TNRIS Hard Drive"
                       onChange={this.handleChange}
                       tabIndex="0"
                       required />
                <div className="mdc-radio__background">
                  <div className="mdc-radio__outer-circle"></div>
                  <div className="mdc-radio__inner-circle"></div>
                </div>
              </div>
              <label htmlFor="hard-drive-tnris-hd-input">TNRIS Provided Hard Drive (1 TB)</label>
            </div>
            <div className='mdc-typography--caption'>TNRIS does not provide multiple 1 TB hard drives for orders larger than 1 TB. If the total order size is over 1 TB of data, you will be required to provide your own hard drive.</div>
            <div id="hard-drive-tnris-flash" className="mdc-form-field">
              <div className="mdc-radio">
                <input className="mdc-radio__native-control"
                       type="radio"
                       id="hard-drive-tnris-flash-input"
                       name="hardDrive"
                       value="TNRIS Flash"
                       onChange={this.handleChange}
                       tabIndex="0" />
                <div className="mdc-radio__background">
                  <div className="mdc-radio__outer-circle"></div>
                  <div className="mdc-radio__inner-circle"></div>
                </div>
              </div>
              <label htmlFor="hard-drive-tnris-flash-input">TNRIS Provided Flash Drive (64 GB)</label>
            </div>
            <div id="hard-drive-customer-hd" className="mdc-form-field">
              <div className="mdc-radio">
                <input className="mdc-radio__native-control"
                       type="radio"
                       id="hard-drive-customer-hd-input"
                       name="hardDrive"
                       value="Customer Hard Drive"
                       onChange={this.handleChange}
                       tabIndex="0" />
                <div className="mdc-radio__background">
                  <div className="mdc-radio__outer-circle"></div>
                  <div className="mdc-radio__inner-circle"></div>
                </div>
              </div>
              <label htmlFor="hard-drive-customer-hd-input">Customer Provided Hard Drive</label>
            </div>
          </div>

          <div className='mdc-typography--headline6'>
            Payment Method*
          </div>
          <div className='mdc-typography--body2'>Once a quote for your order has been completed TNRIS will contact you for payment details.</div>
          <div id="payment-cc" className="mdc-form-field">
            <div className="mdc-radio">
              <input className="mdc-radio__native-control"
                     type="radio"
                     id="payment-cc-input"
                     name="payment"
                     value="Credit Card"
                     onChange={this.handleChange}
                     tabIndex="0"
                     required />
              <div className="mdc-radio__background">
                <div className="mdc-radio__outer-circle"></div>
                <div className="mdc-radio__inner-circle"></div>
              </div>
            </div>
            <label htmlFor="payment-cc-input">Credit Card</label>
          </div>
          <div className='mdc-typography--caption'>Notice: TNRIS does not accept American Express</div>
          <div id="payment-check" className="mdc-form-field">
            <div className="mdc-radio">
              <input className="mdc-radio__native-control"
                     type="radio"
                     id="payment-check-input"
                     name="payment"
                     value="Check"
                     onChange={this.handleChange}
                     tabIndex="0" />
              <div className="mdc-radio__background">
                <div className="mdc-radio__outer-circle"></div>
                <div className="mdc-radio__inner-circle"></div>
              </div>
            </div>
            <label htmlFor="payment-check-input">Check</label>
          </div>
          <div id="payment-fedex" className="mdc-form-field">
            <div className="mdc-radio">
              <input className="mdc-radio__native-control"
                     type="radio"
                     id="payment-fedex-input"
                     name="payment"
                     value="Fedex Customer Account"
                     onChange={this.handleChange}
                     tabIndex="0"
                     disabled />
              <div className="mdc-radio__background">
                <div className="mdc-radio__outer-circle"></div>
                <div className="mdc-radio__inner-circle"></div>
              </div>
            </div>
            <label htmlFor="payment-fedex-input">Fedex Account</label>
          </div>
          <div id="payment-pickup" className="mdc-form-field">
            <div className="mdc-radio">
              <input className="mdc-radio__native-control"
                     type="radio"
                     id="payment-pickup-input"
                     name="payment"
                     value="Pay at Pickup"
                     onChange={this.handleChange}
                     tabIndex="0"
                     disabled />
              <div className="mdc-radio__background">
                <div className="mdc-radio__outer-circle"></div>
                <div className="mdc-radio__inner-circle"></div>
              </div>
            </div>
            <label htmlFor="payment-pickup-input">Pay at Pickup</label>
          </div>

          <div className='mdc-typography--headline6'>
            Pricing Summary
          </div>

          <div className='mdc-typography--body2'>Final cost for your order depends on many variables including hardware, staff time, computer time, data size, etc. TNRIS will contact you with the final, calculated cost.
            For a general estimate of your order, please take a look at the following prices:
          </div>

          <div className='mdc-typography--body2'>
            <h3 className='mdc-list-group__subheader'>Historical Imagery Costs</h3>
            <ul>
              <li>Historical search (1 image per decade): <strong>$40.00 per site</strong></li>
              <li>Single year search: <strong>$18.00 per site</strong></li>
              <li>Scanned historical frame: <strong>$10.00 per image</strong></li>
              <li>Scanned + georeferenced historical frame: <strong>$20.00 per image</strong></li>
              <li>Digital download (0 - 10GB): <strong>$7.00</strong></li>
            </ul>

            <h3 className='mdc-list-group__subheader'>Data Reproduction Costs</h3>
            <ul>
              <li>Staff time: <strong>$46.00 per TB</strong></li>
              <li>Server/computer time: <strong>$0.15 per GB</strong></li>
              <li>TNRIS provided USB flash drive (64 GB): <strong>$40.00</strong></li>
              <li>TNRIS provided external hard drive (1 TB): <strong>$100.00</strong></li>
            </ul>
          </div>
          <br></br>
          <ReCAPTCHA className="recaptcha-container" sitekey="6Lf8GP8SAAAAAFx2H53RtfDO18x7S1q_0pGNdmbd" onChange={this.recaptchaChange} />
          <p className="invalid-prompt">{this.state.invalid}</p>

          <div className="submit-button">
            <input type="submit" value="Submit" id="order-cart-submit" className="mdc-button mdc-button--raised" tabIndex="0" />
          </div>
        </div>
      );
    }
    else if (this.state.display === 'success') {
      showHTML = (
        <div className="order-cart-form-success">
          <p>
            <span><strong>Success!</strong></span>
            <br />
            Your order has been submitted. TNRIS will contact you in a timely manner.
          </p>
        </div>
      );
    }
    else if (this.state.display === 'error') {
      showHTML = (
        <div className="order-cart-form-error">
          <p>
            <span><strong>Error!</strong></span>
            <br />
            Unfortunately, we have encountered an error while submitting your order. Please wait a moment, refresh the page, and try again.
            <br />
            <br />
            {this.props.errorStatus.toString()}
          </p>
        </div>
      );
    }
    else if (this.state.display === 'submitting') {
      showHTML = (
        <div className="order-cart-form-submitting">
          <p>
            <span><strong>Submitting order...</strong></span>
          </p>
        </div>
      );
    }

    return (
      <div className="order-cart-form-component-container">
        <form className="order-cart-form-component" onSubmit={ this.submitForm }>
          <div className='mdc-typography--headline6'>
            <div className='mdc-typography--caption expiration-note'>
              Cart items expire after 14 days
            </div>
          </div>

          <ul className="mdc-list mdc-list--two-line order-cart-data-items">
            {cartItems}
          </ul>
          {showHTML}
        </form>
      </div>
    )
  }
}

export default OrderCart
