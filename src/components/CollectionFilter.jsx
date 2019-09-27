import React from 'react';
import { matchPath } from 'react-router-dom';
import turfExtent from 'turf-extent';
// the carto core api is a CDN in the app template HTML (not available as NPM package)
// so we create a constant to represent it so it's available to the component
const cartodb = window.cartodb;

export default class CollectionFilter extends React.Component {
  constructor(props) {
    super(props);
    this.handleOpenFilterMenu = this.handleOpenFilterMenu.bind(this);
    this.handleSetFilter = this.handleSetFilter.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.showGeoFilter = this.showGeoFilter.bind(this);
    this.handleKeySetFilter = this.handleKeySetFilter.bind(this);
    this.handleSetGeoFilter = this.handleSetGeoFilter.bind(this);
    this.getAreaTypeGeoJson = this.getAreaTypeGeoJson.bind(this);
  }

  componentDidMount () {
    // on component mount, check the URl to apply any necessary filters
    // first, check if url has a 'filters' parameter
    const match = matchPath(
        this.props.location.pathname,
        { path: '/catalog/:filters' }
      );
    const filters = match ? match.params.filters : null;
    if (filters) {
      try {
        const allFilters = JSON.parse(decodeURIComponent(filters));
        // second, check if filters param includes filters key
        if (Object.keys(allFilters).includes('filters')) {
          // third, apply all filters and check those associated checkboxes
          this.props.setCollectionFilter(allFilters.filters);
          Object.keys(allFilters.filters).map(key => {
            allFilters.filters[key].map(id => {
              const hashId = '#' + id;
              if (document.querySelector(hashId)) {
                document.querySelector(hashId).checked = true;
                document.querySelector(`${hashId}-label`).classList.add('filter-active');
              }
              return hashId;
            });
            return key;
          });
        }
        // fourth, apply geo to store and component if present
        if (Object.keys(allFilters).includes('geo')) {
          console.log(allFilters);
          // check if the filter is a user defined polygon or
          // if it is a county filter
          if (allFilters.geo.hasOwnProperty('coordinates')) {
            console.log(allFilters.geo);
            this.handleSetGeoFilter(this, 'draw', allFilters.geo);
          } else if (allFilters.geo.hasOwnProperty('county')) {
            console.log(allFilters.geo.county);
            // set the filter map aoi, selected area type,
            // selected area type name, aand selected area type geojson
            this.getAreaTypeGeoJson('county', allFilters.geo.county);
          }
        }
      } catch (e) {
        console.log(e);
        if (window.location.pathname !== '/404') { this.props.url404(); }
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(prevProps.collectionFilter) !== JSON.stringify(this.props.collectionFilter)) {
      const filterComponent = document.getElementById('filter-component');
      const inputArray = filterComponent.querySelectorAll("input");
      inputArray.forEach(input => {
        return input.checked = false;
      });
      const labelArray = filterComponent.querySelectorAll("label[class='filter-active']");
      labelArray.forEach(label => {
        return label.classList.remove('filter-active');
      });
      Object.keys(this.props.collectionFilter).map(key => {
        this.props.collectionFilter[key].map(id => {
          const hashId = '#' + id;
          if (document.querySelector(hashId)) {
            document.querySelector(hashId).checked = true;
            document.querySelector(`${hashId}-label`).classList.add('filter-active');
          }
          return hashId;
        });
        return key;
      });
    }
  }

  // Gets the selected area_type geometry as geojson from
  // carto and sets this in the app state. We'll also set the
  // selected area_type and area_type_name in the app state
  // for use in the geo filter. This method willl then call
  // the method that sets the geofilter property, "handleSetGeoFilter".
  getAreaTypeGeoJson(areaType, areaTypeName) {
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
      console.log(areaTypeGeoJson);
      this.props.setCollectionFilterMapSelectedAreaType(areaType);
      this.props.setCollectionFilterMapSelectedAreaTypeName(areaTypeName);
      this.props.setCollectionFilterMapSelectedAreaTypeGeoJson(areaTypeGeoJson);
      this.handleSetGeoFilter(this, areaType, areaTypeGeoJson);
    })
  }

  handleSetGeoFilter(_this, aoiType, aoi) {
    // get the bounds from the aoi and query carto
    // to find the area_type polygons that intersect this mbr
    // and return the collection_ids associated with those areas
    let bounds = turfExtent(aoi); // get the bounds with turf.js
    let sql = new cartodb.SQL({user: 'tnris-flood'});
    let query = `SELECT
                   areas_view.collections
                 FROM
                   area_type, areas_view
                 WHERE
                   area_type.area_type_id = areas_view.area_type_id
                 AND
                   area_type.the_geom && ST_MakeEnvelope(
                     ${bounds[2]}, ${bounds[1]}, ${bounds[0]}, ${bounds[3]})`;

    sql.execute(query).done(function(data) {
      // set up the array of collection_id arrays from the returned
      // query object
      let collectionIds = data.rows.map(function (obj) {
        return obj.collections.split(",");
      });
      // combine all collection_id arrays into a single array of unique ids
      let uniqueCollectionIds = [...new Set([].concat(...collectionIds))];
      _this.props.setCollectionFilterMapFilter(uniqueCollectionIds);
      _this.props.setCollectionFilterMapAoi({aoiType: aoiType, payload: aoi});
    }).error(function(errors) {
      // errors contains a list of errors
      console.log("errors:" + errors);
    })
  }

  handleOpenFilterMenu(e) {
    let filterName = e.target.id.split('-')[0];
    let filterListElement = document.getElementById(`${filterName}-list`);
    let filterListTitleIcon = document.getElementById(`${filterName}-expansion-icon`);

    filterListElement.classList.contains('hide-filter-list') ?
      filterListElement.classList.remove('hide-filter-list') :
      filterListElement.classList.add('hide-filter-list');

    filterListTitleIcon.innerHTML === 'expand_more' ?
      filterListTitleIcon.innerHTML = 'expand_less' :
      filterListTitleIcon.innerHTML = 'expand_more';
  }

  handleSetFilter(target) {
    let currentFilters = {...this.props.collectionFilter};

    if (target.checked) {
      if (currentFilters.hasOwnProperty(target.name) && currentFilters[target.name].indexOf(target.value) < 0) {
        currentFilters[target.name].push(target.value);
      } else {
        currentFilters[target.name] = [target.value];
      }
      this.props.setCollectionFilter(currentFilters);
      document.getElementById(`${target.value}-label`).classList.add("filter-active");
    } else {
      if (currentFilters.hasOwnProperty(target.name) && currentFilters[target.name].indexOf(target.value) >= 0) {
        currentFilters[target.name] = currentFilters[target.name].filter(item => item !== target.value);
        // if all checkboxes unchecked, remove from the category's filter object completely
        if (currentFilters[target.name].length === 0) {
          delete currentFilters[target.name];
        }
      }
      this.props.setCollectionFilter(currentFilters);
      document.getElementById(`${target.value}-label`).classList.remove("filter-active");
    }

    // update URL to reflect new filter changes
    const prevFilter = this.props.history.location.pathname.includes('/catalog/') ?
                       JSON.parse(decodeURIComponent(this.props.history.location.pathname.replace('/catalog/', '')))
                       : {};
    const filterObj = {...prevFilter, filters: currentFilters};
    // if all filters turned off, remove from the url completely
    if (Object.keys(filterObj['filters']).length === 0) {
      delete filterObj['filters'];
    }
    const filterString = JSON.stringify(filterObj);
    // if empty filter settings, use the base home url instead of the filter url
    Object.keys(filterObj).length === 0 ? this.props.setUrl('/') : this.props.setUrl('/catalog/' + encodeURIComponent(filterString));
    // log filter change in store
    Object.keys(filterObj).length === 0 ? this.props.logFilterChange('/') : this.props.logFilterChange('/catalog/' + encodeURIComponent(filterString));
  }

  handleKeyPress (e) {
    if (e.keyCode === 13 || e.keyCode === 32) {
      if (e.target.id !== 'filter-map-button') {
        this.handleOpenFilterMenu(e);
      }
      else {
        this.showGeoFilter();
      }
    }
  }

  handleKeySetFilter (e) {
    if (e.keyCode === 13 || e.keyCode === 32) {
      e.target.checked = !e.target.checked;
      this.handleSetFilter(e.target);
    }
  }

  showGeoFilter () {
    this.props.setViewGeoFilter();
    this.props.setUrl('/geofilter/');
  }

  render() {
    console.log(this.props);
    const filterSet = "mdc-list-item filter-list-title mdc-list-item--activated";

    const filterNotSet = "mdc-list-item filter-list-title";

    return (
      <div id='filter-component' className='filter-component'>
        <ul className='mdc-list'>
          {
            Object.keys(this.props.collectionFilterChoices).map(choice =>
              <li key={choice}>
                <div className={Object.keys(this.props.collectionFilter).includes(choice) ? filterSet : filterNotSet}
                     id={`${choice}-title`}
                     onClick={e => this.handleOpenFilterMenu(e)}
                     onKeyDown={(e) => this.handleKeyPress(e)}
                     tabIndex="0">
                     {`by ${choice.replace(/_/, ' ')}`}
                  <i className='mdc-list-item__meta material-icons'
                     id={`${choice}-expansion-icon`}>expand_more</i>
                </div>
                  <ul className='mdc-list hide-filter-list' id={`${choice}-list`}>
                    {
                      this.props.collectionFilterChoices[choice].map((choiceValue, i) =>{
                        const labelValue = choiceValue.replace(/_/g, ' ');
                        return (<li className='mdc-list-item'
                                    key={choiceValue}>
                          <div className='mdc-form-field'>
                            <div className='mdc-checkbox'>
                              <input type='checkbox'
                                     className='mdc-checkbox__native-control'
                                     id={choiceValue}
                                     name={choice}
                                     value={choiceValue}
                                     onChange={e => this.handleSetFilter(e.target)}
                                     onKeyDown={(e) => this.handleKeySetFilter(e)}/>
                              <div className='mdc-checkbox__background'>
                                <svg className='mdc-checkbox__checkmark'
                                     viewBox='0 0 24 24'>
                                  <path className='mdc-checkbox__checkmark-path'
                                        fill='none'
                                        d='M1.73,12.91 8.1,19.28 22.79,4.59'/>
                                </svg>
                                <div className='mdc-checkbox__mixedmark'></div>
                              </div>
                            </div>
                            <label id={`${choiceValue}-label`}
                                   htmlFor={choiceValue}>
                                   {labelValue}
                           </label>
                          </div>
                        </li>);
                    })}
                  </ul>
              </li>
            )
          }
          <li key='filter-map-button'>
            <div className={this.props.collectionFilterMapFilter.length > 0 ? filterSet : filterNotSet}
                 id='filter-map-button'
                 onClick={() => this.showGeoFilter()}
                 onKeyDown={(e) => this.handleKeyPress(e)}
                 tabIndex="0">
                 by geography
            </div>
          </li>
        </ul>
      </div>
    );
  }
}
