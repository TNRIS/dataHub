import React from 'react';

export default class Supplementals extends React.Component {

  render() {
    const tileIndex = this.props.collection.tile_index_url ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <strong>Tile Index:</strong>
        </span>
        <span className="mdc-list-item__meta">
          <a href={this.props.collection.tile_index_url}>
            <i className="material-icons">description</i>Download
          </a>
        </span>
      </li>
    ) : "";

    const supplementalReport = this.props.collection.supplemental_report_url ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <strong>Project Report(s):</strong>
        </span>
        <span className="mdc-list-item__meta">
          <a href={this.props.collection.supplemental_report_url}>
            <i className="material-icons">description</i>Download
          </a>
        </span>
      </li>
    ) : "";

    const lidarBreaklines = this.props.collection.lidar_breaklines_url ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <strong>Lidar Breaklines:</strong>
        </span>
        <span className="mdc-list-item__meta">
          <a href={this.props.collection.lidar_breaklines_url}>
            <i className="material-icons">description</i>Download
          </a>
        </span>
      </li>
    ) : "";

    return (
      <div className="template-content-div">
        <div className='mdc-typography--headline5 template-content-div-header'>
          Supplemental Downloads
        </div>
        <ul className="mdc-list mdc-list--non-interactive supplemental-downloads">
          {tileIndex}
          {supplementalReport}
          {lidarBreaklines}
        </ul>
      </div>
    )
  }
}
