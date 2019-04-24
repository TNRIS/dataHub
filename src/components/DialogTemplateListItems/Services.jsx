import React from 'react';

export default class Services extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      copied: false
    }
    this.copyUrl = this.copyUrl.bind(this);
  }

  copyUrl () {
    const input = document.getElementById("service-link-details-input");
    input.select();
    document.execCommand("copy");
    this.setState({copied: true});
  }

  render() {
    const copied = this.state.copied ? "Copied!" : "Copy URL";
    const previewLink = this.props.collection.popup_link ? (
      <a className="mdc-button mdc-button--raised" href={this.props.collection.popup_link} target="_blank" rel="noopener noreferrer">
        <i className="material-icons">launch</i>Map Preview
      </a>
    ) : ""

    return (
      <div className="template-content-div">
        <div className="mdc-typography--headline5 template-content-div-header">
          Online Mapping Service
        </div>
        <p>
          This dataset is available as an online mapping service. Use the URL
          below to connect to the service in your software. To use the service
          in your software package, consult the software help/support information.
        </p>
        <div className="services-link-details">
          <input type="text" id="service-link-details-input"
                 className="mdc-text-field__input styled-input"
                 value={this.props.collection.wms_link}
                 onBlur={() => this.setState({copied: false})}
                 readOnly/>
          <div className="service-link-details-buttons">
            <button className="mdc-button mdc-button--raised" onClick={this.copyUrl}>
              <i className="material-icons">file_copy</i>{copied}
            </button>
            {previewLink}
          </div>
        </div>
      </div>
    )
  }
}
