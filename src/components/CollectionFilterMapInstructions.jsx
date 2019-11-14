import React from 'react'

// global sass breakpoint variables to be used in js
import breakpoints from '../sass/_breakpoints.scss'

export default class CollectionFilterMapInstructions extends React.Component {
  constructor(props) {
      super(props);

      window.innerWidth >= parseInt(breakpoints.desktop, 10) ? this.state = {
        noteHover: false
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
          Select a county from the dropdown or use the draw tool (
          <div id="instruction-polygon-icon" className="mapbox-gl-draw_polygon"></div>)&nbsp;
          to identify a geographic area.
        </div>
        <div className="mdc-typography--body1 instruction-paragraph">
          To use the draw tool, single click to begin, move cursor to increase the extent/size, single click to finish the drawing.
        </div>
        <div className="mdc-typography--body1 instruction-paragraph">
          Click the "Set Map Filter" button to apply a filter once an area has been identified.
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
