import React from 'react'

export default class LidarBlurb extends React.Component {

  render() {
    return (
      <div className="template-content-div">
        <div className='mdc-typography--headline5 template-content-div-header'>
          About Lidar Data
        </div>
        <p>
          {/*
          Lidar data for Texas is made available online through the use of data compression using&nbsp;
          <a href="https://rapidlasso.com/lastools/" target="_blank" rel="noopener noreferrer">LASTools</a>.
          LASTools is an open-source collection of tools for lidar data viewing and manipulation.
          */}
          Lidar data for Texas is available online through the use of <a href="https://rapidlasso.com/lastools/" target="_blank" rel="noopener noreferrer">LASTools</a>,&nbsp;
          an open-source collection of tools for lidar data viewing and manipulation.
        </p>
      </div>
    )
  }
}
