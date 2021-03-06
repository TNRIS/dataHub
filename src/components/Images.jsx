import React from 'react'

import {Carousel} from 'react-responsive-carousel'

export default class Images extends React.Component {

  componentDidMount() {
    window.scrollTo(0,0);
  }

  render() {

    let carousel_images = this.props.images ? this.props.images.split(',') : "";
    carousel_images = carousel_images.filter(item => item !== this.props.thumbnail);
    carousel_images.unshift(this.props.thumbnail);

    const multiImage = carousel_images.length > 1 ? true : false;

    const padClass = this.props.template === 'outside-entity' ? '' : 'pad-class';

    return (
      <div className='tnris-template-images'>
        <div className={`image-container ${padClass}`}>
          <Carousel
            autoPlay={multiImage}
            infiniteLoop={multiImage}
            showThumbs={multiImage}
            emulateTouch
            useKeyboardArrows={true}
            transitionTime={700}
            interval={6000}
            showIndicators={multiImage}
            showStatus={multiImage} >
            {
              carousel_images.map(url => (
                <div className='carousel-image' key={url}>
                  <img src={url} alt={`${this.props.collection_name}`} />
                </div>
                )
              )
            }
          </Carousel>
        </div>
      </div>
    )
  }
}
