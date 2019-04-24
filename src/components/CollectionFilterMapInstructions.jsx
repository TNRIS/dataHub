import React from 'react';

// global sass breakpoint variables to be used in js
import breakpoints from '../sass/_breakpoints.scss';

export default class CollectionFilterMapInstructions extends React.Component {
  constructor(props) {
      super(props);

      window.innerWidth >= parseInt(breakpoints.desktop, 10) ? this.state = {
        noteHover: true
      } : this.state = {
        noteHover: false
      };

      this.toggleInstructions = this.toggleInstructions.bind(this);
  }

  toggleInstructions () {
    this.setState({
      noteHover: !this.state.noteHover
    });
  }

  render() {

    const noteContent = this.state.noteHover ? (
      <div>
        <i className="material-icons close-icon" onClick={() => {this.setState({noteHover:false})}}>close</i>
        <div className="mdc-typography--body1 instruction-paragraph">
          Use the polygon tool &nbsp;
          <div id="instruction-polygon-icon" className="mapbox-gl-draw_polygon"></div>&nbsp;
          in the top left corner of the map to identify a geographic area.
        </div>
        <div className="mdc-typography--body1 instruction-paragraph">
          Single click to begin drawing, move cursor to draw a filter extent, single click to finish drawing.
        </div>
        <div className="mdc-typography--body1 instruction-paragraph">
          When finished drawing, click the "Set Map Filter" button to apply a filter of the drawn extent.
        </div>
      </div>
    ) : (
      <div className="mdc-typography--body1">Instructions</div>
    );

    return (
      <div id='collection-filter-map-instructions'
           className='mdc-typography--caption'
           onClick={() => {this.toggleInstructions()}}>
        {noteContent}
      </div>
    );
  }
}
