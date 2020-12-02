import React from 'react'

import Description from '../DialogTemplateListItems/Description'
import SourceCitation from '../DialogTemplateListItems/SourceCitation'
import Metadata from '../DialogTemplateListItems/Metadata'
import HistoricalProducts from '../DialogTemplateListItems/HistoricalProducts'
import Ls4Links from '../DialogTemplateListItems/Ls4Links'
import ShareButtons from '../DialogTemplateListItems/ShareButtons'
import HistoricalAerialTemplateIndexDownloadContainer from '../../containers/HistoricalAerialTemplateIndexDownloadContainer'
import CountyCoverageContainer from '../../containers/CountyCoverageContainer'

// global sass breakpoint variables to be used in js
import breakpoints from '../../sass/_breakpoints.module.scss'

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
    // build map layer variables for passing to download map
    let serviceLayer = "";
    if (this.props.collection.index_service_url && this.props.collection.index_service_url !== "") {
      // if multicounty, use word Multi-County. temporary filler in preparation for multi county
      // collections - to be processed thru ls4 in the near future.
      // current state of LORE is that no multi county have been processed thus far
      const locale = this.props.collection.counties.includes(", ") ? "Multi-County" : this.props.collection.counties.replace(/ /g, "");
      const mapfile = this.props.collection.index_service_url.split("/")[this.props.collection.index_service_url.split("/").length - 1]
      serviceLayer = locale + "_" + mapfile.split("_")[1].toUpperCase() + "_" + mapfile.split("_")[2];
    }

    // const popupTitle = this.props.collection.source_abbreviation + ' ' + this.props.collection.acquisition_date.substring(0, 4)+ ': Index Sheets';
    const popupTitle = 'Index Sheets';
    const downloadMap = (
      this.props.collection.template === 'historical-aerial'  &&
      this.props.collection.index_service_url && this.props.collection.index_service_url !== "") ? (
      <HistoricalAerialTemplateIndexDownloadContainer
        indexUrl={this.props.collection.index_service_url}
        serviceLayer={serviceLayer}
        popupTitle={popupTitle} />
    ) : "";
    
    const coverageMap = this.props.collection.counties ? (
      <CountyCoverageContainer
        counties={this.props.collection.counties}
        template={this.props.collection.template}
        historicalIndexUrl={this.props.collection.index_service_url} />
    ) : "";

    const map = (
      window.innerWidth >= this.downloadBreakpoint &&
      this.props.collection.index_service_url && this.props.collection.index_service_url !== "") ? (
        downloadMap
       ) : coverageMap;

    const productsCard = this.props.collection.products ? (
                          <HistoricalProducts products={this.props.collection.products} />)
                          : "";

    const ls4LinksCard = (this.props.collection.index_service_url && this.props.collection.index_service_url !== "") ||
                         (this.props.collection.mosaic_service_url && this.props.collection.mosaic_service_url !== "") ||
                         (this.props.collection.frames_service_url && this.props.collection.frames_service_url !== "") ||
                         (this.props.collection.scanned_index_ls4_links && this.props.collection.scanned_index_ls4_links !== "") ? (
                         <Ls4Links index={this.props.collection.index_service_url}
                                     mosaic={this.props.collection.mosaic_service_url}
                                     frames={this.props.collection.frames_service_url}
                                     scans={this.props.collection.scanned_index_ls4_links} />)
                         : "";

    const sourceCitation = this.props.collection.template === 'historical-aerial' ?
                            <SourceCitation collection={this.props.collection} />
                          : "";

    const acquisition = this.props.collection.acquisition_date ? this.props.collection.acquisition_date.substring(0, 4) : '';

    const collectionObj = this.props.collection;
    let descString = this.props.collection.about ? `<p>${this.props.collection.about}</p>` : "";
    descString += `<p>Use the <strong>Order</strong> tab to submit a request to RDC and acquire digital or physical copies of this ${this.props.collection.name} ${acquisition} dataset.</p>`
    collectionObj.description = descString;


    const archiveAbout = (
      <div className="template-content-div">
        <p className="mdc-typography--headline5">About the Historic Imagery Archive</p>
        <p>
          The Historical Imagery Archive maintained by TNRIS is one of our most used and important data collections. It is comprised of over 1 million frames of photos covering all parts of Texas from dates as far back as the 1920s.
        </p>
        <p>
          The TNRIS Research & Distribution Center (RDC) is charged with preserving this collection, distributing it to the public, and continuing with the large task of digitizing the frames.
        </p>
      </div>
    );

     // using mdc classes to determine grid layout depending on screen size (desktop/tablet)
     // special case with phone or smaller device because order of divs changes
     const gridLayout = window.innerWidth >= parseInt(breakpoints.desktop, 10) ? (
                           <div className="mdc-layout-grid__inner">
                             <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-4'>
                               <Metadata collection={this.props.collection} />
                               {ls4LinksCard}
                               {productsCard}
                               {archiveAbout}
                               {sourceCitation}
                               <ShareButtons />
                             </div>
                             <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-8'>
                               {map}
                               <div className="mdc-layout-grid__inner">
                                 <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-12'>
                                   <Description collection={collectionObj} />
                                 </div>
                               </div>
                             </div>
                           </div>) : (
                           <div className="mdc-layout-grid__inner">
                             <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-12'>
                               {map}
                               <Metadata collection={this.props.collection} />
                               <Description collection={collectionObj} />
                               {sourceCitation}
                               {ls4LinksCard}
                               {productsCard}
                               {archiveAbout}
                               <ShareButtons />
                             </div>
                           </div>);

    return (
      <div className='historical-aerial-template-details'>
        <div className='mdc-layout-grid'>
          {gridLayout}
        </div>
      </div>
    );
  }
}
