import React from 'react'

export default class BackButton extends React.Component {

  constructor(props) {
      super(props);
      this.handleBack = this.handleBack.bind(this);
  }

  handleBack() {
    // special handling for geoFilter due to clear filter functionality inside
    // the geoFilter which updages the url and conflicts with previousUrl
    if (this.props.view === 'geoFilter') {
      this.props.setViewCatalog();
      this.props.setUrl(this.props.catalogFilterUrl);
      // this next condition is for when deving locally
      // if update to code, app refreshes and previousUrl becomes current url;
      // override this by hard setting the url to root
    } else if (this.props.previousUrl === window.location.pathname) {
      this.props.setViewCatalog();
      this.props.setUrl('/')
      // all other conditions, setViewCatalog and use previousUrl
    } else {
      this.props.setViewCatalog();
      this.props.setUrl(this.props.previousUrl);
    }
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
