import React from 'react'

export default class BackButton extends React.Component {

  constructor(props) {
      super(props);
      this.handleBack = this.handleBack.bind(this);
  }

  handleBack() {
    this.props.setViewCatalog();
    this.props.setUrl(this.props.previousUrl);
  }

  render() {
    return (
      <button
        className="mdc-icon-button material-icons close-collection"
        onClick={this.handleBack}
        title="Close this view">
          close
      </button>
    )
  }
}
