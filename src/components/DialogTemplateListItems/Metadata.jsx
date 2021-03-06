import React from 'react'

export default class Metadata extends React.Component {
  render() {
    const partners = this.props.collection.template !== 'outside-entity' && this.props.collection.partners ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text metadata-wraptext-list-item">{this.props.collection.partners}</span>
          <span className="mdc-list-item__secondary-text">Partners</span>
        </span>
      </li>
    ) : "";

    const source = this.props.collection.source_name ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            {this.props.collection.source_name} ({this.props.collection.source_abbreviation})
          </span>
          <span className="mdc-list-item__secondary-text">Source Name</span>
        </span>
      </li>
    ) : "";

    const source_contact = this.props.collection.source_contact ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            {
              this.props.collection.source_contact.includes('http') ? <a href={this.props.collection.source_contact} target="_blank" rel="noopener noreferrer">{this.props.collection.source_contact}</a>
              : this.props.collection.source_contact.includes('@') ? <a href={"mailto:" + this.props.collection.source_contact + "?subject=GIS data question"}>{this.props.collection.source_contact}</a>
              : <p>{this.props.collection.source_contact}</p>
            }
          </span>
          <span className="mdc-list-item__secondary-text">Source Contact</span>
        </span>
      </li>
    ) : "";

    const source_site = this.props.collection.source_website ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            <a href={this.props.collection.source_website} target="_blank" rel="noopener noreferrer">{this.props.collection.source_website}</a>
          </span>
          <span className="mdc-list-item__secondary-text">Source Website</span>
        </span>
      </li>
    ) : "";

    const source_data_site = this.props.collection.source_data_website ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            <a href={this.props.collection.source_data_website} target="_blank" rel="noopener noreferrer">{this.props.collection.source_data_website}</a>
          </span>
          <span className="mdc-list-item__secondary-text">Source Data Website</span>
        </span>
      </li>
    ) : "";

    const epsg = this.props.collection.template !== 'outside-entity' && this.props.collection.spatial_reference ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            {
              this.props.collection.spatial_reference.split(",").map((code,i) => {
                const epsgUrl = "https://epsg.io/" + code;
                return (<span key={i}><a href={epsgUrl} target="_blank" rel="noopener noreferrer">EPSG {code}</a>&nbsp;&nbsp;</span>);
              })
            }
          </span>
          <span className="mdc-list-item__secondary-text">Spatial Reference</span>
        </span>
      </li>
    ) : "";

    const license = this.props.collection.template !== 'outside-entity' && this.props.collection.license_name ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            <a href={this.props.collection.license_url} target="_blank" rel="noopener noreferrer">{this.props.collection.license_name}</a>
          </span>
          <span className="mdc-list-item__secondary-text">License</span>
        </span>
      </li>
    ) : "";

    const mission = this.props.collection.template === 'historical-aerial' && this.props.collection.collection ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            {this.props.collection.collection}
          </span>
          <span className="mdc-list-item__secondary-text">Mission Identifier</span>
        </span>
      </li>
    ) : "";

    const category = this.props.collection.template !== 'outside-entity' && this.props.collection.category ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            {
              this.props.collection.category.includes('_') ?
              (this.props.collection.category.split('_').join(' ')).split(',').join(', ') :
              this.props.collection.category.split(',').join(', ')
            }
          </span>
          <span className="mdc-list-item__secondary-text">Category</span>
        </span>
      </li>
    ) : "";

    const fileType = this.props.collection.template !== 'outside-entity' && this.props.collection.file_type ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            {
              this.props.collection.file_type.split(',').join(', ')
            }
          </span>
          <span className="mdc-list-item__secondary-text">File Type</span>
        </span>
      </li>
    ) : "";

    const downloadFormats = this.props.collection.template !== 'outside-entity' && this.props.collection.resource_types ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            {
              this.props.collection.resource_types.split(',').join(', ')
            }
          </span>
          <span className="mdc-list-item__secondary-text">Download Formats</span>
        </span>
      </li>
    ) : "";

    const resolution = this.props.collection.template !== 'outside-entity' && this.props.collection.resolution ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            {
              this.props.collection.resolution.split(',').join(', ')
            }
          </span>
          <span className="mdc-list-item__secondary-text">Resolution</span>
        </span>
      </li>
    ) : "";

    const bandTypes = this.props.collection.template !== 'outside-entity' && this.props.collection.band_types ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            {
              this.props.collection.band_types.split(',').join(', ')
            }
          </span>
          <span className="mdc-list-item__secondary-text">Bands</span>
        </span>
      </li>
    ) : "";

    const mediaType = this.props.collection.template === 'historical-aerial' && this.props.collection.media_type ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text metadata-wraptext-list-item">
            {this.props.collection.media_type}
          </span>
          <span className="mdc-list-item__secondary-text">Archive Media Type</span>
        </span>
      </li>
    ) : "";

    const generalScale = this.props.collection.template === 'historical-aerial' && this.props.collection.general_scale ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">
            {this.props.collection.general_scale}
          </span>
          <span className="mdc-list-item__secondary-text">General Archive Scale</span>
        </span>
      </li>
    ) : "";

    // 
    // Historical Aerials: Scan Status of Frames entity
    // 
    // start with logic, if historical-aerial template and fully scanned is true, label as complete;
    // otherwise, assume in progress
    const fullyScanned = this.props.collection.template === 'historical-aerial' && this.props.collection.fully_scanned ? (
      <div className="mdc-chip" role="row">
        <div className="mdc-chip__ripple"></div>
        <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">done</i>
        <span role="gridcell">
          <span role="button" className="mdc-chip__primary-action">
            <span className="mdc-chip__text">Complete</span>
          </span>
        </span>
      </div>
    ) : (
      <div className="mdc-chip" role="row">
        <div className="mdc-chip__ripple"></div>
        <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">sync</i>
        <span role="gridcell">
          <span role="button" className="mdc-chip__primary-action">
            <span className="mdc-chip__text">In Progress</span>
          </span>
        </span>
      </div>
    );
    // overwrite/trump previous logic if photo_index_only true. this logic trumps b/c if only photo indexes,
    // then there are no frames to be complete or scanning in progress. although this trumps regardless, the 
    // situation logically would only be photo_index_only true when fully_scanned false b/c a collection
    // cannot be fully scanned when there are no frames to scan
    const fullyScannedFixed = this.props.collection.template === 'historical-aerial' && this.props.collection.photo_index_only ? (
      <div className="mdc-chip" role="row">
        <div className="mdc-chip__ripple"></div>
        <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">block</i>
        <span role="gridcell">
          <span role="button" className="mdc-chip__primary-action">
            <span className="mdc-chip__text">No Single Frames Available</span>
          </span>
        </span>
      </div>
    ) : fullyScanned;
    const frameScanStatus = this.props.collection.template === 'historical-aerial' ? (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          {fullyScannedFixed}
          <span className="mdc-list-item__secondary-text">Scan Status of Frames</span>
        </span>
      </li>
    ) : "";

    return (
      <div className="template-content-div metadata">
        <div className='mdc-typography--headline5 template-content-div-header'>
          Metadata
        </div>
        <ul className="mdc-list mdc-list--non-interactive">
          {partners}
          {source}
          {source_site}
          {source_data_site}
          {source_contact}
          {epsg}
          {license}
          {mission}

          {fileType}
          {downloadFormats}
          {resolution}
          {bandTypes}
          {category}

          {mediaType}
          {generalScale}
          {frameScanStatus}
        </ul>
      </div>
    )
  }
}
