import React, { Component } from 'react';
import {MDCTextField} from '@material/textfield';
import {MDCFloatingLabel} from '@material/floating-label';
import {MDCLineRipple} from '@material/line-ripple';
import {MDCRipple} from '@material/ripple';
import {MDCSwitch} from '@material/switch';
import {MDCTextFieldHelperText} from '@material/textfield/helper-text';

class OrderTnrisDataForm extends Component {

  constructor(props) {
      super(props);
      // if dataset already in cart, tell the user. otherwise, show the form
      const startDisplay = this.props.orders.hasOwnProperty(this.props.selectedCollection) ? 'cart' : 'form';
      // form field values tracked in state
      this.state = {
        orderType: '',
        portionDescription: '',
        aoiUpload: '',
        screenshotUpload: '',
        textDescription: '',
        breaklines: false,
        dem: false,
        hypso: false,
        laz: true,
        las: false,
        paper8x11: false,
        paper11x17: false,
        digital: true,
        digitalGeoref: false,
        display: startDisplay,
        invalid: null
      }
      this.collection = this.props.collections[this.props.selectedCollection];
      this.submitForm = this.submitForm.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleSwitch = this.handleSwitch.bind(this);
      // set aside declaration of data type: Lidar, Historic Imagery, or all others
      if (this.collection.category && this.collection.category.indexOf('Lidar') !== -1) {
        this.dataForm = 'lidar';
      }
      else if (this.collection.category && this.collection.category.indexOf('Historic Imagery') !== -1) {
        this.dataForm = 'historicImagery';
      }
      else {
        this.dataForm = null;
      }
  }

  componentDidMount() {
    // initiate Material form inputs
    document.querySelectorAll('.mdc-floating-label').forEach((mdl) => {
      new MDCFloatingLabel(mdl);
    });
    document.querySelectorAll('.mdc-line-ripple').forEach((mlr) => {
      new MDCLineRipple(mlr);
    });
    document.querySelectorAll('.mdc-text-field').forEach((mtf) => {
      new MDCTextField(mtf);
    });
    document.querySelectorAll('.mdc-button').forEach((mb) => {
      new MDCRipple(mb);
    });
    document.querySelectorAll('.mdc-switch').forEach((ms) => {
      if (ms.id === 'order-lidar-laz') {
        const lazSwitch = new MDCSwitch(ms);
        lazSwitch.checked = true;
      }
      else if (ms.id === 'order-historical-digital') {
        const digitalSwitch = new MDCSwitch(ms);
        digitalSwitch.checked = true;
      }
      else if (ms.id === 'order-historical-digitalGeoref') {
        this.digitalGeoref = new MDCSwitch(ms);
      }
      else {
        new MDCSwitch(ms);
      }
    });
    document.querySelectorAll('.mdc-text-field-helper-text').forEach((ht) => {
      new MDCTextFieldHelperText(ht);
    });
    window.scrollTo(0,0);
  }

  componentDidUpdate () {
    // toggle form and dialogues of submission lifecycle
    if (this.props.uploading === false &&
        this.props.uploadError !== null &&
        this.state.display === 'uploading') {
      this.setState({
        display: 'form',
        invalid: 'There was a problem with your file upload. Please try again.'
      });
    }
    else if (this.props.uploading === false &&
             this.props.uploadError === null &&
             this.state.display === 'uploading') {
      this.setState({
        display: 'added',
        invalid: null
      });
    }

    // alter form requirements and inputs displayed based on form input selections
    if (this.state.orderType === 'Partial') {
      document.getElementsByName("portionDescription").forEach((input) => {
        input.required = true;
      });
    }
    else {
      document.getElementsByName("portionDescription").forEach((input) => {
        input.required = false;
        input.checked = false;
      });
    }

    document.getElementsByName("aoiUpload").forEach((fileInput) => {
      fileInput.required = false;
    });
    document.getElementsByName("screenshotUpload").forEach((fileInput) => {
      fileInput.required = false;
    });
    document.getElementsByName("textDescription").forEach((textarea) => {
      textarea.required = false;
    });

    switch (this.state.portionDescription) {
      case 'AOI':
        document.getElementsByName("aoiUpload").forEach((fileInput) => {
          fileInput.required = true;
        });
        break;
      case 'Screenshot':
        document.getElementsByName("screenshotUpload").forEach((fileInput) => {
          fileInput.required = true;
        });
        break;
      case 'Text':
        document.getElementsByName("textDescription").forEach((textarea) => {
          textarea.required = true;
        });
        break;
      default:
        break;
    }

    if (this.dataForm === 'historicImagery' && this.state.digital) {
      this.digitalGeoref.disabled = false;
    }
    else if (this.dataForm === 'historicImagery' && !this.state.digital) {
      this.digitalGeoref.disabled = true;
    }
  }

  handleChange(event) {
    // on form field value change, update state
    const name = event.target.name
    const value = event.target.value
    const nextState = {};
    nextState[name] = value;
    if (name === 'orderType' && value === 'Full') {
      nextState['portionDescription'] = "";
    }
    if (name === 'orderType' && value === 'Full') {
      nextState['portionDescription'] = "";
    }
    this.setState(nextState);
  }

  handleSwitch(event) {
    // form switches value changes need to update state
    const name = event.target.name
    const nextState = {};
    nextState[name] = !this.state[name];
    if (name === 'digital' && this.state.digital) {
      this.digitalGeoref.checked = false;
      nextState['digitalGeoref'] = false;
    }
    this.setState(nextState);
  }

  submitForm (event) {
    event.preventDefault();
    // when adding dataset to cart, apply the current datetime so that they
    // can be expired 14 days after adding to cart. this is because s3 uploads
    // auto-delete in this time period
    const cartDate = Date.now();
    const cartInfo = {
      coverage: this.state.orderType,
      cartDate: cartDate
    };
    // if a lidar dataset, they must select at least 1 format of data
    if (this.dataForm === 'lidar') {
      if (!this.state.breaklines &&
          !this.state.laz &&
          !this.state.las &&
          !this.state.dem &&
          !this.state.hypso) {
        this.setState({
          invalid: 'At least one Lidar Format selection is required.'
        });
        return;
      }
      else {
        // create pretty string from their selected formats
        const formats = [];

        if (this.state.laz) {formats.push('LAZ');}
        if (this.state.las) {formats.push('LAS');}
        if (this.state.dem) {formats.push('DEM');}
        if (this.state.hypso) {formats.push('Hypso');}
        if (this.state.breaklines) {formats.push('Breaklines');}
        cartInfo['formats'] = formats.join("/");
        this.setState({
          invalid: null
        });
      }
    }
    // if a historic imagery dataset, they must select at least 1 format of data
    if (this.dataForm === 'historicImagery') {
      if (!this.state.paper8x11 &&
          !this.state.paper11x17 &&
          !this.state.digital) {
        this.setState({
          invalid: 'At least one Historic Imagery Format selection is required.'
        });
        return;
      }
      else {
        // create pretty string from their selected formats
        const formats = [];

        if (this.state.paper8x11) {formats.push('Paper 8.5x11');}
        if (this.state.paper11x17) {formats.push('Paper 11x17');}
        if (this.state.digital) {formats.push('Digital Scan');}
        if (this.state.digitalGeoref) {formats.push('Georeferenced');}
        cartInfo['formats'] = formats.join("/");
        this.setState({
          invalid: null
        });
      }
    }
    // if a partial dataset, handle the lifecycle of the uploads
    if (this.state.orderType === 'Partial') {
      switch (this.state.portionDescription) {
        case 'AOI':
          if (document.getElementById('order-partial-aoi-file').files[0].size > 20971520) {
            this.setState({
              display: 'form',
              invalid: 'Your zipfile exceeds the 20 MB limit. Please choose another zipfile.'
            });
          }
          else if (document.getElementById('order-partial-aoi-file').files[0].name.substr(document.getElementById('order-partial-aoi-file').files[0].name.length - 4) !== '.zip') {
            this.setState({
              display: 'form',
              invalid: 'Your file must be a zipfile (.zip extension). Please choose a zipfile.'
            });
          }
          else {
            cartInfo['type'] = 'AOI';
            cartInfo['files'] = document.getElementById('order-partial-aoi-file').files;
            this.setState({display: 'uploading'});
            this.props.uploadOrderFile(this.props.selectedCollection, cartInfo);
          }
          break;
        case 'Screenshot':
          const screenshotFileList = document.getElementById('order-partial-screenshot-file').files;
          Array.from(screenshotFileList).every((file, index) => {
            if (file.size > 5242880) {
              this.setState({
                display: 'form',
                invalid: 'One or more of your screenshots exceeds the 5 MB limit. Please choose another image.'
              });
              return false;
            }
            else if (file.size <= 5242880 && index >= screenshotFileList.length - 1) {
              cartInfo['type'] = 'Screenshot';
              cartInfo['files'] = document.getElementById('order-partial-screenshot-file').files;
              this.setState({display: 'uploading'});
              this.props.uploadOrderFile(this.props.selectedCollection, cartInfo);
              return true;
            }
            else {
              return true;
            }
          });
          break;
        case 'Text':
          cartInfo['type'] = 'Text';
          cartInfo['description'] = this.state.textDescription;
          this.props.addCollectionToCart(this.props.selectedCollection, cartInfo);
          this.setState({
            display: 'added',
            invalid: null
          });
          break;
        default:
          break;
      }
    }
    else if (this.state.orderType === 'Full') {
      // if a full dataset, there are no uploads so just add to cart
      this.props.addCollectionToCart(this.props.selectedCollection, cartInfo);
      this.setState({
        display: 'added',
        invalid: null
      });
    }
  }

  render() {
    // toggle classes based on other form input selections
    const partialClass = this.state.orderType === 'Partial' ? "partial-description-field" : "hidden-field";
    const uploadAoiClass = this.state.portionDescription === 'AOI' ? "mdc-form-field" : "mdc-form-field hidden-field";
    const uploadScreenshotClass = this.state.portionDescription === 'Screenshot' ? "mdc-form-field" : "mdc-form-field hidden-field";
    const textDescriptionClass = this.state.portionDescription === 'Text' ? "mdc-text-field mdc-text-field--textarea" : "mdc-text-field mdc-text-field--textarea hidden-field";
    const invalid = this.state.invalid ? this.state.invalid : '';
    let showHTML;
    let lidarFields;
    let historicalFields;
    // if a lidar dataset, add format switches
    if (this.dataForm === 'lidar') {
      lidarFields = (
        <div className="order-lidar-switches">
          <div className='mdc-typography--headline6'>
            Lidar Format Options
          </div>
          <div className="mdc-form-field">
            <div className="mdc-switch">
              <div className="mdc-switch__track"></div>
              <div className="mdc-switch__thumb-underlay">
                <div className="mdc-switch__thumb">
                  <input type="checkbox"
                         id="order-lidar-dem-input"
                         className="mdc-switch__native-control"
                         name="dem"
                         onChange={this.handleSwitch} />
                </div>
              </div>
            </div>
            <label htmlFor="order-lidar-dem-input">Digital Elevation Model (DEM)</label>
          </div>
          <div className="mdc-form-field">
            <div className="mdc-switch">
              <div className="mdc-switch__track"></div>
              <div className="mdc-switch__thumb-underlay">
                <div className="mdc-switch__thumb">
                  <input type="checkbox"
                         id="order-lidar-hypso-input"
                         className="mdc-switch__native-control"
                         name="hypso"
                         onChange={this.handleSwitch} />
                </div>
              </div>
            </div>
            <label htmlFor="order-lidar-hypso-input">Hypsography (Contours)</label>
          </div>
          <div className="mdc-form-field">
            <div className="mdc-switch" id="order-lidar-laz">
              <div className="mdc-switch__track"></div>
              <div className="mdc-switch__thumb-underlay">
                <div className="mdc-switch__thumb">
                  <input type="checkbox"
                         id="order-lidar-laz-input"
                         className="mdc-switch__native-control"
                         name="laz"
                         onChange={this.handleSwitch} />
                </div>
              </div>
            </div>
            <label htmlFor="order-lidar-laz-input">LAZ Point Cloud (Compressed)</label>
          </div>
          <div className="mdc-form-field">
            <div className="mdc-switch">
              <div className="mdc-switch__track"></div>
              <div className="mdc-switch__thumb-underlay">
                <div className="mdc-switch__thumb">
                  <input type="checkbox"
                         id="order-lidar-las-input"
                         className="mdc-switch__native-control"
                         name="las"
                         onChange={this.handleSwitch} />
                </div>
              </div>
            </div>
            <label htmlFor="order-lidar-las-input">LAS Point Cloud (Uncompressed)</label>
          </div>
          <div className='mdc-typography--caption'>Selecting LAS will drastically increase cost and order turn around time</div>
          <div className="mdc-form-field">
            <div className="mdc-switch">
              <div className="mdc-switch__track"></div>
              <div className="mdc-switch__thumb-underlay">
                <div className="mdc-switch__thumb">
                  <input type="checkbox"
                         id="order-lidar-breaklines-input"
                         className="mdc-switch__native-control"
                         name="breaklines"
                         onChange={this.handleSwitch} />
                </div>
              </div>
            </div>
            <label htmlFor="order-lidar-breaklines-input">Breaklines (if available)</label>
          </div>
          <div className='mdc-typography--caption'>Also may be available for direct download under 'Supplemental Downloads'</div>
        </div>
      )
    }

    if (this.dataForm === 'historicImagery') {
      historicalFields = (
        <div className="order-historical-switches">
          <div className='mdc-typography--headline6'>
            Historic Imagery Format Options
          </div>
          <div className="mdc-form-field">
            <div className="mdc-switch">
              <div className="mdc-switch__track"></div>
              <div className="mdc-switch__thumb-underlay">
                <div className="mdc-switch__thumb">
                  <input type="checkbox"
                         id="order-historical-paper8x11-input"
                         className="mdc-switch__native-control"
                         name="paper8x11"
                         onChange={this.handleSwitch} />
                </div>
              </div>
            </div>
            <label htmlFor="order-historical-paper8x11-input">Paper Laser Copy (8.5" x 11")</label>
          </div>
          <div className="mdc-form-field">
            <div className="mdc-switch">
              <div className="mdc-switch__track"></div>
              <div className="mdc-switch__thumb-underlay">
                <div className="mdc-switch__thumb">
                  <input type="checkbox"
                         id="order-historical-paper11x17-input"
                         className="mdc-switch__native-control"
                         name="paper11x17"
                         onChange={this.handleSwitch} />
                </div>
              </div>
            </div>
            <label htmlFor="order-historical-paper11x17-input">Paper Laser Copy (11" x 17")</label>
          </div>
          <div className="mdc-form-field">
            <div className="mdc-switch" id="order-historical-digital">
              <div className="mdc-switch__track"></div>
              <div className="mdc-switch__thumb-underlay">
                <div className="mdc-switch__thumb">
                  <input type="checkbox"
                         id="order-historical-digital-input"
                         className="mdc-switch__native-control"
                         name="digital"
                         onChange={this.handleSwitch} />
                </div>
              </div>
            </div>
            <label htmlFor="order-historical-digital-input">Digital Scan of Original Copy</label>
          </div>
          <div className="mdc-form-field">
            <div className="mdc-switch" id="order-historical-digitalGeoref">
              <div className="mdc-switch__track"></div>
              <div className="mdc-switch__thumb-underlay">
                <div className="mdc-switch__thumb">
                  <input type="checkbox"
                         id="order-historical-digitalGeoref-input"
                         className="mdc-switch__native-control"
                         name="digitalGeoref"
                         onChange={this.handleSwitch} />
                </div>
              </div>
            </div>
            <label htmlFor="order-historical-digitalGeoref-input">Georeference the Digital Scan</label>
          </div>
        </div>
      )
    }


    if (this.state.display === 'form') {
      showHTML = (
        <div>
          <p className="mdc-typography--body2">
            Is there no download option for this dataset? Is everything you're looking for too large to directly download? Every dataset is available for order directly from TNRIS.
          </p>

          <div className='mdc-typography--headline6'>
            Dataset Order Type*
          </div>
          <div id="order-type-full" className="mdc-form-field">
            <div className="mdc-radio">
              <input className="mdc-radio__native-control"
                     type="radio"
                     id="order-type-full-input"
                     name="orderType"
                     value="Full"
                     onChange={this.handleChange}
                     required />
              <div className="mdc-radio__background">
                <div className="mdc-radio__outer-circle"></div>
                <div className="mdc-radio__inner-circle"></div>
              </div>
            </div>
            <label htmlFor="order-type-full-input">Full (Entire Dataset)</label>
          </div>
          <div id="order-type-partial" className="mdc-form-field">
            <div className="mdc-radio">
              <input className="mdc-radio__native-control"
                     type="radio"
                     id="order-type-partial-input"
                     name="orderType"
                     value="Partial"
                     onChange={this.handleChange} />
              <div className="mdc-radio__background">
                <div className="mdc-radio__outer-circle"></div>
                <div className="mdc-radio__inner-circle"></div>
              </div>
            </div>
            <label htmlFor="order-type-partial-input">Partial (Described Portion)</label>
          </div>

          <div className={partialClass}>
            <div className='mdc-typography--headline6'>
              Portion Description*
            </div>
            <p className="mdc-typography--body2">
              How would you like to help us identify which portion of the data you need?
            </p>
            <div id="order-partial-aoi" className="mdc-form-field">
              <div className="mdc-radio">
                <input className="mdc-radio__native-control"
                       type="radio"
                       id="order-partial-aoi-input"
                       name="portionDescription"
                       value="AOI"
                       onChange={this.handleChange} />
                <div className="mdc-radio__background">
                  <div className="mdc-radio__outer-circle"></div>
                  <div className="mdc-radio__inner-circle"></div>
                </div>
              </div>
              <label htmlFor="order-partial-aoi-input">Area of Interest Boundary File (TNRIS Preferred Option)</label>
            </div>
            <div className='mdc-typography--caption'>Only zipfiles (.zip) accepted. Select a Shapefile or KML within a compressed zipfile to upload. Maximum allowed file size is 20 MB. <a href="http://geojson.io" target="_blank" rel="noopener noreferrer">Don't have a shapefile? Draw one here!</a></div>
            <div className={uploadAoiClass}>
              <input type="file"
                     id="order-partial-aoi-file"
                     name="aoiUpload"
                     accept=".zip"
                     onChange={this.handleChange}
              />
            </div>
            <div id="order-partial-screenshot" className="mdc-form-field">
              <div className="mdc-radio">
                <input className="mdc-radio__native-control"
                       type="radio"
                       id="order-partial-screenshot-input"
                       name="portionDescription"
                       value="Screenshot"
                       onChange={this.handleChange} />
                <div className="mdc-radio__background">
                  <div className="mdc-radio__outer-circle"></div>
                  <div className="mdc-radio__inner-circle"></div>
                </div>
              </div>
              <label htmlFor="order-partial-screenshot-input">Screenshot Image(s)</label>
            </div>
            <div className='mdc-typography--caption'>Select a .png, .jpg, or .jpeg image to upload. Multiple images are accepted. Maximum allowed file size is 5 MB.</div>
            <div className={uploadScreenshotClass}>
              <input type="file"
                     id="order-partial-screenshot-file"
                     name="screenshotUpload"
                     accept=".png, .jpg, .jpeg"
                     onChange={this.handleChange}
                     multiple />
            </div>
            <div id="order-partial-text" className="mdc-form-field">
              <div className="mdc-radio">
                <input className="mdc-radio__native-control"
                       type="radio"
                       id="order-partial-text-input"
                       name="portionDescription"
                       value="Text"
                       onChange={this.handleChange} />
                <div className="mdc-radio__background">
                  <div className="mdc-radio__outer-circle"></div>
                  <div className="mdc-radio__inner-circle"></div>
                </div>
              </div>
              <label htmlFor="order-partial-text-input">Text Description</label>
            </div>
            <div className='mdc-typography--caption'>Please describe the portion of data you need in the text box. Providing as much detail as possible will vastly improve the response and turn around time of your order.</div>
            <div id="order-partial-text-description" className={textDescriptionClass}>
              <textarea id="order-partial-text-description-input" className="mdc-text-field__input"
                        rows="8" cols="40"
                        name="textDescription"
                        onChange={this.handleChange}>
              </textarea>
              <label className="mdc-floating-label" htmlFor="order-partial-text-description-input">Please describe the portion of data you need...</label>
              <div className="mdc-line-ripple"></div>
            </div>
            <p id="order-partial-text-description-helper-text" className="mdc-text-field-helper-text" aria-hidden="true">
              <strong>Latitude/Longitude Coordinates, USGS Quadrangle Names, Historic Imagery Frame Numbers (from the index scans), City/Town Names, Cross Roads, Boundary Landmarks, etc. </strong>
            </p>
          </div>

          {lidarFields}
          {historicalFields}

          <p className="order-tnris-data-message invalid-prompt">{invalid}</p>

          <div className="submit-button">
            <input type="submit" value="Add to Shopping Cart" id="order-tnris-data-submit" className="mdc-button mdc-button--raised"/>
          </div>
        </div>
      );
    }

    else if (this.state.display === 'cart') {
      showHTML = (
        <div className="order-tnris-data-message">
          <p className="mdc-typography--body2">
            This dataset is already in the shopping cart.
          </p>
          <p className="mdc-typography--body2">
            Please visit the shopping cart to finalize your order.
          </p>
        </div>
      );
    }
    else if (this.state.display === 'added') {
      showHTML = (
        <div className="order-tnris-data-message">
          <p className="mdc-typography--body2">
            This dataset has been added to the shopping cart.
          </p>
          <p className="mdc-typography--body2">
            Please visit the shopping cart to finalize your order.
          </p>
        </div>
      );
    }
    else if (this.state.display === 'uploading') {
      showHTML = (
        <div className="order-tnris-data-message">
          <div className='mdc-typography--headline6'>
            Uploading files...
          </div>
        </div>
      );
    }

    return (
      <form className="order-tnris-data-form-component" onSubmit={ this.submitForm }>
        {showHTML}
      </form>
    )
  }
}

export default OrderTnrisDataForm
