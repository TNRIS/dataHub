import React from 'react'

import CollectionFilterMapContainer from '../containers/CollectionFilterMapContainer';
import BackButtonContainer from '../containers/BackButtonContainer'

// global sass breakpoint variables to be used in js
import breakpoints from '../sass/_breakpoints.module.scss'

export default class CollectionFilterMapView extends React.Component {
  constructor() {
    super();
    this.handleResize = this.handleResize.bind(this);
    this.downloadBreakpoint = parseInt(breakpoints.download, 10);
    const initDownload = window.innerWidth >= this.downloadBreakpoint ? true : false;
    this.state = {
      download: initDownload
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    window.scrollTo(0,0);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize() {
    if (window.innerWidth >= this.downloadBreakpoint) {
      this.setState({download: true});
    }
    else {
      this.setState({download:false});
    }
  }

  render() {
    const mobileNotice = (
      <div id='collection-filter-map' className='tnris-download-template-download'>
        <div className="tnris-download-template-download__mobile">
          <p>
            In consideration of user experience,
            the filter by geography map has been <strong>disabled</strong> for small browser windows and mobile devices.
          </p>
          <p>
            Please visit this page with a desktop computer or increase the browser window size and refresh
            the page to use the filter by geography tool.
          </p>
        </div>
      </div>
    );
    const map = this.state.download ? <CollectionFilterMapContainer /> : mobileNotice;

    return (
      <div className="filter-map-view">
        <div className="mdc-top-app-bar__row">
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <h2 className="mdc-top-app-bar__title">
              Filter by Geography
            </h2>
          </section>
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end">            
            <BackButtonContainer />
          </section>
        </div>
        {map}
      </div>
    );
  }
}
