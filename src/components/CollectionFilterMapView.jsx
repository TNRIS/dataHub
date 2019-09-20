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
    this.handleGetCountyAndQuadNames = this.handleGetCountyAndQuadNames.bind(this);
    this.handleGetAreaTypeGeoJson = this.handleGetAreaTypeGeoJson.bind(this);
    this.handleChangeCountyName = this.handleChangeCountyName.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0,0);
    this.handleGetCountyAndQuadNames();
    const select = new MDCSelect(document.querySelector('.mdc-select'));
  }

  componentDidUpdate() {
    console.log("component updated");
    if (!this.props.collectionFilterMapSelectedAreaTypeName) {
      const select = document.getElementById("county-select");
      select.selectedIndex = 0;
      // select.blur();
    }
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

  handleGetCountyAndQuadNames() {
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

  handleGetAreaTypeGeoJson(areaType, areaTypeName) {
    console.log("function called");
    console.log(areaTypeName);
    let sql = new cartodb.SQL({user: 'tnris-flood'});
    let query = `SELECT row_to_json(fc)
                 FROM (
                   SELECT
                     'FeatureCollection' AS "type",
                     array_to_json(array_agg(f)) AS "features"
                   FROM (
                     SELECT
                       'Feature' AS "type",
                         ST_AsGeoJSON(area_type.the_geom) :: json AS "geometry",
                         (
                           SELECT json_strip_nulls(row_to_json(t))
                           FROM (
                             SELECT
                               area_type.area_type_name
                           ) t
                           ) AS "properties"
                     FROM area_type
                     WHERE
                       area_type.area_type_name = '${areaTypeName}' AND
                       area_type.area_type = '${areaType}'
                   ) as f
                 ) as fc`;

    sql.execute(query).done( (data) => {
      let areaTypeGeoJson = data.rows[0].row_to_json;
      this.props.setCollectionFilterMapSelectedAreaType({
        areaType: areaType,
        areaTypeName: areaTypeName,
        areaTypeGeoJson: areaTypeGeoJson
      });
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
    console.log(this.props);

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
              <div className="mdc-select mdc-select--outlined">
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
