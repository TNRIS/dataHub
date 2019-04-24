import React from 'react';

export default class TnrisDownloadMapNote extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        noteHover: false,
        noteInstruct: true
      };
      this.toggleInstructions = this.toggleInstructions.bind(this);
  }

  toggleInstructions () {
    this.setState({
      noteInstruct: !this.state.noteInstruct
    });
  }

  render() {
    const noteContent = this.state.noteHover ? (
      <p>
        Every dataset (excluding External Link availability) is available for order directly from TNRIS. Click the Order tab if the quantity of data needed is too large to download.
        <br />
        Every downloadable dataset is publically available via an AWS S3 bucket and can be accessed using the AWS CLI for bulk and programmatic downloads. Click the Contact tab to inquire with TNRIS about details related to S3 bulk access.
      </p>
    ) : (
      <i className="material-icons">toys</i>
    );

    const noteInstruct = this.state.noteInstruct ? (
      <div>
        <i className="material-icons close-icon" title="Minimize instructions" onClick={() => {this.toggleInstructions()}}>close</i>
        <p title="Download Instructions">
          Click a polygon in the map to view available downloads and information.
        </p>
      </div>
    ) : (
      <i className="material-icons" title="Download Instructions" onClick={() => {this.toggleInstructions()}}>info</i>
    );

    return (
      <div>
        <div id='tnris-download-instructions'
          className='mdc-typography--caption'>
          {noteInstruct}
        </div>

        <div id='tnris-download-note'
          className='mdc-typography--caption'
          onMouseEnter={() => {this.setState({noteHover:true})}}
          onMouseLeave={() => {this.setState({noteHover:false})}}>
          {noteContent}
        </div>
      </div>
    );
  }
}
