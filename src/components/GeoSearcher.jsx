import React from 'react';
import Downshift from 'downshift';
import axios from 'axios';
import { MDCTextField } from '@material/textfield'

export default class GeoSearcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      features: [],
      inputValue: ''
    }
  }

  componentDidMount() {
    // instantiate the material textfield component
    this.searchField = new MDCTextField(
      document.querySelector('.geo-search-component')
    );
    this.searchFieldInput = document.querySelector('.geo-search-input');
  }
  
  // onChange method for the downshift component
  downshiftOnChange = selectedItem => {
    if (selectedItem !== null) {
      this.setState({ inputValue: selectedItem.properties.display_name });
      // send the selected feature and update the map
      this.props.handleGeoSearcherChange(selectedItem);
      this.searchFieldInput.blur();
    }
  }
  
  // onChange method for the input field
  inputOnChange = event => {
    this.setState({ inputValue: event.target.value });
    // fetch features from the api after input change      
    this.fetchFeatures(event.target.value)
  }
  
  // fetches the features from the geocoder api
  fetchFeatures = feature => {    
    const geocodeUrl = `https://nominatim.tnris.org/search/\
      ${feature}?format=geojson&polygon_geojson=1`;
    // ajax request to retrieve the features
    axios.get(geocodeUrl).then(response => {
      this.setState({ features: response.data.features })
    })
  }

  // clears the search input and resets the local state
  handleClearSearch = () => {
      this.setState({inputValue: ''});
      this.fetchFeatures('');
      this.props.removeGeoSearcherLayer();
      this.searchFieldInput.focus();
  }

  // keyDown that watches for the escape keypress
  handleKeyDown = event => {
    if (event.keyCode === 27 && !this.state.inputValue) {
      this.props.removeGeoSearcherLayer();
      this.searchFieldInput.blur();
    }
  }

  render() {
    return (
      <Downshift
      onChange={ this.downshiftOnChange }
      itemToString={ item => (item ? item.value : '')}
      >
      {({
        selectedItem,
        getInputProps,
        getItemProps,
        highlightedIndex,
        isOpen,
        inputValue,
        getLabelProps,
        getRootProps,
        getMenuProps,
      }) => (
        <div
          className={`geo-search-component mdc-text-field
            mdc-text-field--fullwidth mdc-text-field--with-leading-icon
            mdc-text-field--with-trailing-icon mdc-menu-surface--anchor`}
          { ...getRootProps({}, {suppressRefError: true}) }
        >
          <i
            id="search-icon"
            className="material-icons mdc-text-field__icon"
          >
            search
          </i>
          <input
          className={"geo-search-input downshift-input mdc-text-field__input"}
          {...getInputProps({
            value: this.state.inputValue,
            placeholder: "Search for Places in Texas",
            onChange: this.inputOnChange,
            onKeyDown: this.handleKeyDown
          })}
          />
          {this.state.inputValue ?
              <button
                id='clear-icon'
                className={`clear-button mdc-top-app-bar__action-item
                  material-icons mdc-icon-button mdc-text-field__icon`}
                tabIndex="3"
                onClick={this.handleClearSearch}>
                clear
              </button> : ''}
          {isOpen && this.state.features !== undefined &&
           this.state.features.length !== 0 ?
          <ul
            className="suggestion-list downshift-dropdown mdc-list"
            { ...getMenuProps() }
          >
            {this.state.features
              .map((item, index) => (
              <li
                className="dropdown-item mdc-list-item"
                { ...getItemProps({ key: index, index, item }) }
              >
                { item.properties.display_name }
              </li>
              ))}
            </ul> : null}
        </div>
      )}
      </Downshift>
    )
  }
}