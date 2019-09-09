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
      countyNames: []
    }
    this.handleBack = this.handleBack.bind(this);
    this.getCountyAndQuadNames = this.getCountyAndQuadNames.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0,0);
    this.getCountyAndQuadNames();

    const select = new MDCSelect(document.querySelector('.mdc-select'));
    select.listen('MDCSelect:change', () => {
      this.props.setCollectionFilterMapSelectedCountyName(select.value);
      this.props.setCollectionFilterMapMoveMap(true);
      // this.setState({
      //   selectedCountyName: select.value,
      //   moveMap: true
      // })
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
    console.log(this.props);
    return (
      <div className="filter-map-view">
        <div className="mdc-top-app-bar__row">
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <h2 className="mdc-top-app-bar__title">
              Filter by Geography
            </h2>
          </section>
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end">
            <div className="county-select__wrapper">
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
            </div>
            <button
              className="close-shopping-cart mdc-icon-button material-icons"
              onClick={this.handleBack}
              title="Close geography filter">
              close
            </button>
          </section>
        </div>
        <CollectionFilterMapContainer />
      </div>
    );
  }
}
