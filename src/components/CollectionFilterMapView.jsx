import React from 'react';

import CollectionFilterMapContainer from '../containers/CollectionFilterMapContainer';

export default class CollectionFilterMapView extends React.Component {
  constructor() {
    super();
    this.handleBack = this.handleBack.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0,0);
  }

  handleBack() {
    this.props.setViewCatalog();
    if (window.location.pathname === this.props.previousUrl) {
      this.props.setUrl('/');
    }
    else if (this.props.previousUrl === '/cart/') {
      this.props.setUrl(this.props.catalogFilterUrl);
    }
    else {
      this.props.setUrl(this.props.previousUrl);
    }
  }

  render() {
    return (
      <div className="filter-map-view">
        <div className="mdc-top-app-bar__row">
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <h2 className="mdc-top-app-bar__title">
              Filter by Geography
            </h2>
          </section>
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end">
            <button
              className="close-shopping-cart mdc-icon-button material-icons"
              onClick={this.handleBack}
              title="Close geography filter">
              close
            </button>
          </section>
        </div>
        <CollectionFilterMapContainer />
      </div>
    );
  }
}
