import React from 'react'

export default class LidarBlurb extends React.Component {

  render() {
    return (
      <div className="template-content-div">
        <div className='mdc-typography--headline5 template-content-div-header'>
          About Lidar Data
        </div>
        <p>
          Lidar data for Texas is available online through the use of <a href="https://rapidlasso.com/lastools/" target="_blank" rel="noopener noreferrer">LASTools</a>,&nbsp;
          an open-source collection of tools for lidar data viewing and manipulation.
        </p>
        <p>
          Click <a href="https://cdn.tnris.org/data/lidar/tnris-lidar_48_vector.zip">here</a> to download a complete index of all available lidar data at TNRIS.
        </p>
      </div>
    )
  }
}
