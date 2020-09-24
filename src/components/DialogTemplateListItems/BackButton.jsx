import React from 'react'

export default class BackButton extends React.Component {

  constructor(props) {
      super(props);
      this.handleBack = this.handleBack.bind(this);
  }

  handleBack() {
    // check if in cart. 
    // Cart is only route with multiple paths to it. 
    // So if previousUrl is collection, go back to that collection
    // Else, go home using stored filter parameters
    if (this.props.view === 'orderCart' && this.props.previousUrl.startsWith('/collection')) {
        this.props.setViewCollection();
        this.props.setUrl(this.props.previousUrl);
        this.props.selectCollection(this.props.selectedCollection);
        console.log(this.props.selectedCollection, this.props.previousUrl)
      
    } else {
      this.props.setViewCatalog();
      this.props.setUrl(this.props.catalogFilterUrl);
    }
  }

  render() {
    console.log(this.props)
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
