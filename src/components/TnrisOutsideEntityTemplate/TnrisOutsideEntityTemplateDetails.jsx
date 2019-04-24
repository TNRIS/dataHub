import React from 'react';

import Description from '../DialogTemplateListItems/Description'
import Metadata from '../DialogTemplateListItems/Metadata'
import ShareButtons from '../DialogTemplateListItems/ShareButtons'
import Images from '../DialogTemplateListItems/Images'
import OeServices from '../DialogTemplateListItems/OeServices'

// global sass breakpoint variables to be used in js
import breakpoints from '../../sass/_breakpoints.scss';

export default class TnrisOutsideEntityTemplateDetails extends React.Component {

  componentDidMount () {
    window.scrollTo(0,0);
  }

  render() {
    const imageCarousel = this.props.collection.images ? (
                        <Images
                          thumbnail={this.props.collection.thumbnail_image}
                          images={this.props.collection.images} />)
                        : "";

    const externalEntityBlurb = (
      <div className="template-content-div external-entity-blurb-container">
        <div className="mdc-typography--subtitle1">
          External Entity Disclaimer
        </div>
        <p className="external-entity-blurb">
          {this.props.collection.name} datasets and information are maintained by entities other than TNRIS.
          The provided links and emails will take the user from the TNRIS site directly to the external entity.
        </p>
      </div>
    )

    // using mdc classes to determine grid layout depending on screen size (desktop/tablet)
    // special case with phone or smaller device because order of components changes
    const gridLayout = window.innerWidth >= parseInt(breakpoints.desktop, 10) ? (
                          <div className="mdc-layout-grid__inner">
                            <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-4'>
                              <Metadata collection={this.props.collection} />
                              <ShareButtons />
                              <OeServices collection={this.props.collection} />
                            </div>
                            <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-8'>
                              {imageCarousel}
                              <div className="mdc-layout-grid__inner">
                                <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-8'>
                                  <Description collection={this.props.collection} />
                                </div>
                                <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-4'>
                                  {externalEntityBlurb}
                                </div>
                              </div>
                            </div>
                          </div>) : (
                          <div className="mdc-layout-grid__inner">
                            <div className='mdc-layout-grid__cell mdc-layout-grid__cell--span-12'>
                              {imageCarousel}
                              <Metadata collection={this.props.collection} />
                              <Description collection={this.props.collection} />
                              {externalEntityBlurb}
                              <ShareButtons />
                              <OeServices collection={this.props.collection} />
                            </div>
                          </div>);

    return (
      <div className='outside-entity-template-details'>
        <div className='mdc-layout-grid'>

          {gridLayout}

        </div>
      </div>
    );
  }
}
