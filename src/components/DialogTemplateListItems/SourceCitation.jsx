import React from 'react';

// global sass breakpoint variables to be used in js
import breakpoints from '../../sass/_breakpoints.scss';

export default class SourceCitation extends React.Component {
  constructor(props) {
    super(props);
    window.innerWidth >= parseInt(breakpoints.desktop, 10) ? this.state = {
      gridLayout:'desktop',
      copied: false
    } : this.state = {
      gridLayout:'mobile',
      copied: false
    };

    this.handleResize = this.handleResize.bind(this);
    this.copySourceCitation = this.copySourceCitation.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize() {
    if (window.innerWidth >= parseInt(breakpoints.desktop, 10)) {
      this.setState({gridLayout:'desktop'});
    }
    else {
      this.setState({gridLayout:'mobile'});
    }
  }

  copySourceCitation () {
    const textarea = document.getElementById("citation");
    textarea.select();
    this.setState({copied: true});
    document.execCommand("copy");
  }

  render() {

    const copied = this.state.copied ? "Copied!" : "Copy Citation";
    const now = new Date();
    const dateString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
    const sourceCitationText = `${this.props.collection.source_name} (${this.props.collection.source_abbreviation}). ${this.props.collection.name}, ${this.props.collection.acquisition_date}. Web. ${dateString}.`
    const textAreaRows = this.state.gridLayout === 'desktop' ? "4" : "2";

    return (
      <div className="template-content-div">
        <div className="citation-container">
          <div className="mdc-typography--subtitle1 citation-header">
            Dataset Citation
          </div>
          <textarea
            type="text"
            id="citation"
            className="mdc-text-field__input citation"
            rows={textAreaRows}
            value={sourceCitationText}
            onBlur={() => this.setState({copied: false})}
            readOnly>
          </textarea>
          <div className="citation-button-container services-link-details">
            <div className="service-link-details-buttons">
              <button className="mdc-button mdc-button--raised" onClick={this.copySourceCitation}>
                <i className="material-icons">file_copy</i>{copied}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
