import React from 'react'
import { matchPath } from 'react-router-dom'
import turfBbox from '@turf/bbox'

export default class CollectionFilter extends React.Component {
  constructor(props) {
    super(props);
    this.openFilterMenu = this.openFilterMenu.bind(this);
    this.setFilter = this.setFilter.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.showGeoFilter = this.showGeoFilter.bind(this);
    this.handleKeySetFilter = this.handleKeySetFilter.bind(this);
    this.handleSetGeoFilter = this.handleSetGeoFilter.bind(this);
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
                document.querySelector(
                  `${hashId}-label`
                ).classList.add('filter-active');
              }
              return hashId;
            });
            return key;
          });
        }
        // fourth, apply geo to store and component if present
        if (Object.keys(allFilters).includes('geo')) {
          // check if the filter is a user defined polygon or
          // if it is a geocoder feature filter
          if (allFilters.geo.hasOwnProperty('coordinates')) {
            this.handleSetGeoFilter(this, 'draw', allFilters.geo);
          } else if (allFilters.geo.hasOwnProperty('osm')) {
            // clear the GeoSearcher input value and call the
            // fetchFeatures method to set the filter
            this.props.setGeoSearcherInputValue(allFilters.geo.osm)
            this.fetchFeatures(allFilters.geo.osm)
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

    // expand filter titles in tool drawer if filter is applied
    const filterTitleList = document.querySelectorAll("#availability-title, #category-title");
    filterTitleList.forEach(function(item) {
      if (item.classList.contains('mdc-list-item--activated')) {
        item.children[0].innerHTML = 'expand_less';
        item.nextSibling.classList.remove('hide-filter-list');
      }
    })
  }

  // fetch features from the geocoder api
  fetchFeatures = feature => {    
    const geocodeUrl = `https://nominatim.tnris.org/search/\
      ${feature}?format=geojson&polygon_geojson=1`;
    // ajax request to retrieve the features
    fetch(geocodeUrl)
      .then(response => response.json())
      .then(json => {
        // response returns an array and we want the first item
        this.handleSetGeoFilter(this, 'osm', json.features[0]);
      })
      .catch(error => {
        console.log(error);
      })
  }

  handleSetGeoFilter(_this, aoiType, aoi) {
    // get the bounds from the aoi and query mapserver
    // to find the area_type polygons that intersect this mbr
    // and return the collection_ids associated with those areas
    let bounds = turfBbox(aoi); // get the bounds with turf.js
    let geoJsonFeatures = `https://mapserver.tnris.org/?map=/tnris_mapfiles/download_areas.map&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=envelope_query&outputformat=geojson&SRSNAME=EPSG:4326&xmin=${bounds[2]}&ymin=${bounds[1]}&xmax=${bounds[0]}&ymax=${bounds[3]}`;
    fetch(geoJsonFeatures)
    .then(res => res.json())
    .then(json => {
      // set up the array of collection_id arrays from the returned
      // query object
      let collectionIds = json.features.map(function (obj) {
        return obj.properties.collections.split(",");
      });
      // combine all collection_id arrays into a single array of unique ids
      let uniqueCollectionIds = [...new Set([].concat(...collectionIds))];
      _this.props.setCollectionFilterMapFilter(uniqueCollectionIds);
      _this.props.setCollectionFilterMapAoi({aoiType: aoiType, payload: aoi});
    })
    .catch(error => console.log(error));
  }

  openFilterMenu(e) {
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

  setFilter(target) {
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
        this.openFilterMenu(e);
      }
      else {
        this.showGeoFilter();
      }
    }
  }

  handleKeySetFilter (e) {
    if (e.keyCode === 13 || e.keyCode === 32) {
      e.target.checked = !e.target.checked;
      this.setFilter(e.target);
    }
  }

  showGeoFilter () {
    this.props.setViewGeoFilter();
    this.props.setUrl('/geofilter/');
  }

  render() {
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
                     onClick={e => this.openFilterMenu(e)}
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
                        return (
                          <li className='mdc-list-item'
                                    key={choiceValue}>
                          <div className='mdc-form-field'>
                            <div className='mdc-checkbox'>
                              <input type='checkbox'
                                     className='mdc-checkbox__native-control'
                                     id={choiceValue}
                                     name={choice}
                                     value={choiceValue}
                                     onChange={e => this.setFilter(e.target)}
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
                      })
                    }
                  </ul>
              </li>
            )
          }
          <li key='filter-map-button'>
            <div className={
                  this.props.collectionFilterMapFilter.length > 0 ?
                    filterSet : filterNotSet
                }
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
