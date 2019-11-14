import React from 'react'

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
    this.getAreaTypeNames = this.getAreaTypeNames.bind(this);
    this.handleChangeCountyName = this.handleChangeCountyName.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0,0);
    this.getAreaTypeNames();
    const countySelect = new MDCSelect(document.querySelector('.county-select'));
    // float the label above the select element if there
    // is an area type selected on render.
    if (
      this.props.collectionFilterMapSelectedAreaTypeName &&
      this.props.collectionFilterMapSelectedAreaType === "county"
    ) {
      let adapter = countySelect.foundation_.adapter_;
      adapter.floatLabel(true);
      adapter.notchOutline(84.75);
    }
  }

  componentDidUpdate() {
    const countySelect = new MDCSelect(document.querySelector('.county-select'));
    // Disable the select if a map filter is set. Reenable
    // when the filter is cleared.
    if (this.props.collectionFilterMapFilter.length > 0) {
      countySelect.disabled = true;
    } else {
      countySelect.disabled = false;
    }
  }

  handleBack() {
    this.props.setViewCatalog();
    this.props.setUrl(this.props.catalogFilterUrl);
  }

  getAreaTypeNames() {
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
      data.rows.map(row => {
        if (row["area_type"] === "county") {
          counties.push(row["area_type_name"]);
        }
        return row
      });
      this.setState({countyNames: counties})
      return counties
    }).error(function(errors) {
      // errors contains a list of errors
      console.log("errors:" + errors);
    })
  }

  handleChangeCountyName(event) {
    let areaType = event.target.id.split("-")[0];
    let areaTypeName = event.target.value;
    this.props.setCollectionFilterMapSelectedAreaType(areaType);
    this.props.setCollectionFilterMapSelectedAreaTypeName(areaTypeName);
    this.props.setCollectionFilterMapMoveMap(true);
  }

  render() {
    let countyNameOptions = [
      <option value="" key="" disabled></option>
    ].concat(this.state.countyNames.map(countyName => {
      return <option value={countyName} key={countyName}>{countyName}</option>;
    }));

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
                  id="county-select"
                  value={
                    this.props.collectionFilterMapSelectedAreaTypeName ?
                    this.props.collectionFilterMapSelectedAreaTypeName : ""}
                  onChange={this.handleChangeCountyName}
                  ref="countySelect">
                  {countyNameOptions}
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
