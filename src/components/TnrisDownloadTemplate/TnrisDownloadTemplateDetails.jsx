import React from 'react'

import Description from '../DialogTemplateListItems/Description'
import SourceCitation from '../DialogTemplateListItems/SourceCitation'
import LidarBlurb from '../DialogTemplateListItems/LidarBlurb'
import Metadata from '../DialogTemplateListItems/Metadata'
import Services from '../DialogTemplateListItems/Services'
import Supplementals from '../DialogTemplateListItems/Supplementals'
import ShareButtons from '../DialogTemplateListItems/ShareButtons'

import TnrisDownloadTemplateDownloadContainer from '../../containers/TnrisDownloadTemplateDownloadContainer'
// coverage map for mobile
import CountyCoverageContainer from '../../containers/CountyCoverageContainer'

// global sass breakpoint variables to be used in js
import breakpoints from '../../sass/_breakpoints.scss'

export default class TnrisDownloadTemplateDetails extends React.Component {
  constructor(props) {
    super(props)

    window.innerWidth >= parseInt(breakpoints.desktop, 10) ? this.state = {
        gridLayout:'desktop'
      } : this.state = {
        gridLayout:'mobile'
      };

    this.handleResize = this.handleResize.bind(this);
    this.downloadBreakpoint = parseInt(breakpoints.download, 10);
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    window.scrollTo(0,0);
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

  render() {

    const downloadMap = this.props.collection.template === 'tnris-download' ? (
                          <TnrisDownloadTemplateDownloadContainer collectionName={this.props.collection.name} />
                        ) : "";

    const coverageMap = this.props.collection.counties ? (
                          <CountyCoverageContainer
                            counties={this.props.collection.counties}
                            template={this.props.collection.template} />
                        ) : "";

    const map = window.innerWidth >= this.downloadBreakpoint ? downloadMap : coverageMap;

    const lidarCard = this.props.collection.category.includes('Lidar') ? (
                        <LidarBlurb />)
                        : "";

    const supplementalDownloadsCard = (this.props.collection.tile_index_url ||
                                        this.props.collection.supplemental_report_url ||
                                        this.props.collection.lidar_breaklines_url) ? (
                                          <Supplementals collection={this.props.collection} />)
                                          : "";

    const servicesCard = this.props.collection.wms_link ? (
                          <Services collection={this.props.collection} />)
                          : "";

    const description = this.props.collection.description ? (
                          <Description collection={this.props.collection} />)
                          : "";

    const sourceCitation = this.props.collection.template === 'tnris-download' ?
                            <SourceCitation collection={this.props.collection} />
                          : "";

    // using mdc classes to determine grid layout depending on screen size (desktop/tablet)
    // special case with phone or smaller device because order of components changes
    const gridLayout = this.state.gridLayout === 'desktop' ? (
                        <div className="mdc-layout-grid__inner">
                          <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-4">
                            <Metadata collection={this.props.collection} />
                            {lidarCard}
                            {servicesCard}
                            {supplementalDownloadsCard}
                            {sourceCitation}
                            <ShareButtons />
                          </div>
                          <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-8'>
                            {map}
                            <div className="mdc-layout-grid__inner">
                              <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-12'>
                                {description}
                              </div>
                            </div>
                          </div>
                        </div>) : (
                        <div className="mdc-layout-grid__inner">
                          <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-12'>
                            {map}
                            <Metadata collection={this.props.collection} />
                            {description}
                            {sourceCitation}
                            {lidarCard}
                            {servicesCard}
                            {supplementalDownloadsCard}
                            <ShareButtons />
                          </div>
                        </div>);


    return (
      <div className='tnris-download-template-details'>
        <div className='mdc-layout-grid'>

          {gridLayout}

        </div>
      </div>

    );
  }
}
