import React from 'react'

export default class Ls4Links extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      indexCopied: false,
      mosaicCopied: false,
      framesCopied: false
    }
    this.copyUrl = this.copyUrl.bind(this);
  }

  copyUrl (inputId, stateKey) {
    const nextState = {
      indexCopied: false,
      mosaicCopied: false,
      framesCopied: false
    };
    const input = document.getElementById(inputId);
    input.select();
    document.execCommand("copy");
    nextState[stateKey] = true;
    this.setState(nextState);
  }

  render() {
    const indexTitle = (
      <div>
        <div className="mdc-typography--headline5 template-content-div-header">
          Scanned Indexes
        </div>
        <p>
          This Historic Imagery dataset has scanned indexes (.tif format) available for download. Use the scanned indexes to view this collection's spatial extent and the identification numbers of the individual frames which comprise it.
        </p>
        <p>
          <strong>Note:</strong> Frames shown within each index sheet may or may not be availabile due to incomplete collections within the archive.
        </p>
      </div>
    )

    const scans = this.props.scans ? JSON.parse("[" + this.props.scans + "]") : [];
    const indexCopied = this.state.indexCopied ? "Copied!" : "Copy URL";
    const indexSheets = scans.length > 0 && this.props.index !== "" ? (
        <div className="ls4-scans">
          {indexTitle}
          <ul className="mdc-list">
            {scans.map((scan, index) => {
              const odd = index % 2 === 1 ? "mdc-list-item odd" : "mdc-list-item even";
              return (
                <li key={index} className={odd}>
                  <div>Sheet #{scan.sheet}</div>
                  <div>{scan.link.split('/')[5]}</div>
                  <div>{scan.size}</div>
                  <div>
                    <a href={scan.link} target="_blank" rel="noopener noreferrer">Download</a>
                  </div>
                </li>
              )}
            )}
          </ul>
        </div>
      ) : (
        <div className="ls4-links">
          {indexTitle}
          <div className="mdc-typography--headline5 template-content-div-header">
            Index WMS Service
          </div>
          <input type="text" id="ls4-links-index-input"
                className="mdc-text-field__input"
                value={this.props.index} readOnly/>
          <div className="ls4-links-buttons">
            <button className="mdc-button mdc-button--raised" onClick={() => this.copyUrl('ls4-links-index-input', 'indexCopied')}>
              <i className="material-icons">file_copy</i>{indexCopied}
            </button>
          </div>
        </div>
      );

    // const mosaicCopied = this.state.mosaicCopied ? "Copied!" : "Copy URL";
    const mosaicUrl = "";
    // const mosaicUrl = this.props.mosaic && this.props.mosaic !== "" ? (
    //   <div className="ls4-links">
    //     <div className="mdc-typography--headline5 template-content-div-header">
    //       Mosaic WMS Service
    //     </div>
    //     <p className="mdc-typography--caption">
    //       (Comprised only of the currently scanned dataset frames)
    //     </p>
    //     <input type="text" id="ls4-links-mosaic-input"
    //            className="mdc-text-field__input"
    //            value={this.props.mosaic} readOnly/>
    //          <div className="ls4-links-buttons">
    //       <button className="mdc-button mdc-button--raised" onClick={() => this.copyUrl('ls4-links-mosaic-input', 'mosaicCopied')}>
    //         <i className="material-icons">file_copy</i>{mosaicCopied}
    //       </button>
    //     </div>
    //   </div>
    // ) : "";

    // const framesCopied = this.state.framesCopied ? "Copied!" : "Copy URL";
    const framesUrl = "";
    // const framesUrl = this.props.frames && this.props.frames !== "" ? (
    //   <div className="ls4-links">
    //     <div className="mdc-typography--headline5 template-content-div-header">
    //       Individual Frames WMS Service
    //     </div>
    //     <p className="mdc-typography--caption">
    //       (Comprised only of the currently scanned dataset frames)
    //     </p>
    //     <input type="text" id="ls4-links-frames-input"
    //            className="mdc-text-field__input"
    //            value={this.props.frames} readOnly/>
    //          <div className="ls4-links-buttons">
    //       <button className="mdc-button mdc-button--raised" onClick={() => this.copyUrl('ls4-links-frames-input', 'framesCopied')}>
    //         <i className="material-icons">file_copy</i>{framesCopied}
    //       </button>
    //     </div>
    //   </div>
    // ) : "";

    return (
      <div className="template-content-div ls4-links-container">
        {indexSheets}
        {mosaicUrl}
        {framesUrl}
      </div>
    )
  }
}
