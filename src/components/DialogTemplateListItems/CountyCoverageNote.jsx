import React from 'react';

export default class CountyCoverageNote extends React.Component {
  constructor(props) {
      super(props);

      this.state = {
        noteInstruct: true
      };

      this.toggleInstructions = this.toggleInstructions.bind(this);
  }

  componentDidMount () {
    // setTimeout to close noteInstruct after 8 secs
    this.noteInstructTimer = setTimeout(() => {
      this.setState({
        noteInstruct: false
      })
    }, 10000);
  }

  componentWillUnmount () {
    // clear setTimeout
    if (this.noteInstructTimer) {
      clearTimeout(this.noteInstructTimer);
    }
  }

  toggleInstructions () {
    this.setState({
      noteInstruct: !this.state.noteInstruct
    });
  }

  render() {

    const noteInstruct = this.state.noteInstruct ? (
      <div>
        <i className="material-icons close-icon" title="Minimize Information" onClick={() => {this.toggleInstructions()}}>close</i>
        <p title="Coverage Information">
          <strong>Note: </strong>This is a map showing the general coverage area for this dataset. You
          cannot download the data from here, but you can order the data by clicking the order tab. Imagery
          may have incomplete coverage for a particular county and may be of varying quality.
        </p>
      </div>
    ) : (
      <i className="material-icons" title="Expand Information" onClick={() => {this.toggleInstructions()}}>info</i>
    );

    return (
      <div>
        <div id='county-coverage-notice'
          className='mdc-typography--caption'>
          {noteInstruct}
        </div>
      </div>
    );
  }
}
