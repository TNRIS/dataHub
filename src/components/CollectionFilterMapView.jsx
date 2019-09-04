import React from 'react';

import {MDCSelect} from '@material/select';

import CollectionFilterMapContainer from '../containers/CollectionFilterMapContainer';

// the carto core api is a CDN in the app template HTML (not available as NPM package)
// so we create a constant to represent it so it's available to the component
const cartodb = window.cartodb;

export default class CollectionFilterMapView extends React.Component {
  constructor() {
    super();
    this.state = {
      countyNames: [],
      selectedCountyName: ""
    }
    this.handleBack = this.handleBack.bind(this);
    this.getCountyAndQuadNames = this.getCountyAndQuadNames.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0,0);
    this.getCountyAndQuadNames();

    const select = new MDCSelect(document.querySelector('.mdc-select'));
    select.listen('MDCSelect:change', () => {
      this.setState({selectedCountyName: select.value})
      // alert(`Selected option at index ${select.selectedIndex} with value "${select.value}"`);
    });
  }

  handleBack() {
    this.props.setViewCatalog();
    if (window.location.pathname === this.props.previousUrl) {
      this.props.setUrl('/');
    }
    else if (this.props.previousUrl === '/cart/') {
      this.props.setUrl(this.props.catalogFilterUrl);
    }
    else {
      this.props.setUrl(this.props.previousUrl);
    }
  }

  getCountyAndQuadNames() {
    let sql = new cartodb.SQL({user: 'tnris-flood'});
    let query = `SELECT
                   areas_view.area_type_name, areas_view.area_type
                 FROM
                   areas_view
                 WHERE
                   areas_view.area_type IN ('county', 'quad')
                 ORDER BY
                   areas_view.area_type, areas_view.area_type_name;`

    sql.execute(query).done( (data) => {
      let counties = [];
      let quads = [];
      data.rows.map(row => {
        if (row["area_type"] === "county") {
          counties.push(row["area_type_name"]);
        } else {
          quads.push(row["area_type_name"]);
        }
      });
      this.setState({countyNames: counties})
      return counties
    }).error(function(errors) {
      // errors contains a list of errors
      console.log("errors:" + errors);
    })
  }

  render() {
    console.log(this.state);
    return (
      <div className="filter-map-view">
        <div className="mdc-top-app-bar__row">
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <h2 className="mdc-top-app-bar__title">
              Filter by Geography
            </h2>
            {/*<div className="mdc-select demo-width-class">
              <input type="hidden" name="enhanced-select"></input>
              <i className="mdc-select__dropdown-icon"></i>
              <div className="mdc-select__selected-text"></div>
              <div className="mdc-select__menu mdc-menu mdc-menu-surface demo-width-class">
                <ul className="mdc-list">
                  <li className="mdc-list-item mdc-list-item--selected" data-value="" aria-selected="true"></li>
                  <li className="mdc-list-item" data-value="grains">
                    Bread, Cereal, Rice, and Pasta
                  </li>
                  <li className="mdc-list-item" data-value="vegetables">
                    Vegetables
                  </li>
                  <li className="mdc-list-item" data-value="fruit">
                    Fruit
                  </li>
                </ul>
              </div>
              <span className="mdc-floating-label">Pick a Food Group</span>
              <div className="mdc-line-ripple"></div>
            </div>*/}

            <div className="mdc-select mdc-select--outlined county-select">
              <i className="mdc-select__dropdown-icon"></i>
              <select className="mdc-select__native-control"
                defaultValue="">
                <option value="" disabled></option>
                {this.state.countyNames.map((countyName) =>
                  <option
                    value={countyName}
                    key={countyName}>
                    {countyName}
                  </option>
                )}
              </select>
              <div className="mdc-notched-outline">
                <div className="mdc-notched-outline__leading"></div>
                <div className="mdc-notched-outline__notch">
                  <label className="mdc-floating-label">Select a County</label>
                </div>
                <div className="mdc-notched-outline__trailing"></div>
              </div>
            </div>
          </section>
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end">
            <button
              className="close-shopping-cart mdc-icon-button material-icons"
              onClick={this.handleBack}
              title="Close geography filter">
              close
            </button>
          </section>
        </div>
        <CollectionFilterMapContainer
          selectedCountyName={this.state.selectedCountyName} />
      </div>
    );
  }
}
