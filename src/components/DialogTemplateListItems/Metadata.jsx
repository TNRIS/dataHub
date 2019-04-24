import React from 'react';

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

    // const acquisition = this.props.collection.acquisition_date ? this.props.collection.acquisition_date.substring(0, 4) : '';
    // const acq_year = this.props.collection.template !== 'outside-entity' && this.props.collection.acquisition_date ? (
    //   <li className="mdc-list-item">
    //     <span className="mdc-list-item__text">
    //       <span className="mdc-list-item__primary-text">
    //         {acquisition}
    //       </span>
    //       <span className="mdc-list-item__secondary-text">Acquisition</span>
    //     </span>
    //   </li>
    // ) : "";

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

    // const dataTypes = this.props.collection.template !== 'outside-entity' && this.props.collection.data_types ? (
    //   <li className="mdc-list-item">
    //     <span className="mdc-list-item__text">
    //       <strong>Data Types:</strong>
    //     </span>
    //     <span className="mdc-list-item__text">
    //       {this.props.collection.data_types}
    //     </span>
    //   </li>
    // ) : "";

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

    // const coverageExtent = this.props.collection.template !== 'outside-entity' && this.props.collection.coverage_extent ? (
    //   <li className="mdc-list-item">
    //     <span className="mdc-list-item__text">
    //       <strong>Coverage Extent:</strong>
    //     </span>
    //     <span className="mdc-list-item__text">
    //       {this.props.collection.coverage_extent}
    //     </span>
    //   </li>
    // ) : "";

    // const knownIssues = this.props.collection.template !== 'outside-entity' && this.props.collection.known_issues ? (
    //   <li className="mdc-list-item">
    //     <span className="mdc-list-item__text">
    //       <strong>Known Issues:</strong>
    //     </span>
    //     <span className="mdc-list-item__text">
    //       {this.props.collection.known_issues}
    //     </span>
    //   </li>
    // ) : "";

    // const recommendedUse = this.props.collection.template !== 'outside-entity' && this.props.collection.recommended_use ? (
    //   <li className="mdc-list-item">
    //     <span className="mdc-list-item__text">
    //       <strong>Recommended Use:</strong>
    //     </span>
    //     <span className="mdc-list-item__text">
    //       {this.props.collection.recommended_use}
    //     </span>
    //   </li>
    // ) : "";

    // const tags = this.props.collection.template !== 'outside-entity' && this.props.collection.tags ? (
    //   <li className="mdc-list-item">
    //     <span className="mdc-list-item__text">
    //       <strong>Tags:</strong>
    //     </span>
    //     <span className="mdc-list-item__text">
    //       {this.props.collection.tags}
    //     </span>
    //   </li>
    // ) : "";

    return (
      <div className="template-content-div metadata">
        <ul className="mdc-list mdc-list--non-interactive">
          {partners}
          {source}
          {source_site}
          {source_data_site}
          {source_contact}
          {epsg}
          {license}

          {fileType}
          {downloadFormats}
          {resolution}
          {bandTypes}
          {category}

          {mediaType}
          {generalScale}
        </ul>
      </div>
    )
  }
}
