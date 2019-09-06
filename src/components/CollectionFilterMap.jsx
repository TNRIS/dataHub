import React from 'react';
import CollectionFilterMapInstructions from './CollectionFilterMapInstructions';

import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import turfExtent from 'turf-extent';
import styles from '../sass/index.scss';

// global sass breakpoint variables to be used in js
import breakpoints from '../sass/_breakpoints.scss';

// the carto core api is a CDN in the app template HTML (not available as NPM package)
// so we create a constant to represent it so it's available to the component
const cartodb = window.cartodb;

export default class CollectionFilterMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapFilteredCollectionIds: this.props.collectionFilterMapFilter,
      countyNames: [],
      selectedCountyName: this.props.selectedCountyName,
      moveMap: true
    }
    // bind our map builder and other custom functions
    this.createMap = this.createMap.bind(this);
    this.resetTheMap = this.resetTheMap.bind(this);
    this.enableUserInteraction = this.enableUserInteraction.bind(this);
    this.disableUserInteraction = this.disableUserInteraction.bind(this);
    this.handleFilterButtonClick = this.handleFilterButtonClick.bind(this);
    this.getExtentIntersectedCollectionIds = this.getExtentIntersectedCollectionIds.bind(this);
    this.moveToSelectedMapFeature = this.moveToSelectedMapFeature.bind(this);
    this.downloadBreakpoint = parseInt(breakpoints.download, 10);
  }

  componentDidMount() {
    if (this.props.view !== 'geoFilter') {
      this.props.setViewGeoFilter();
    }
    if (window.innerWidth > this.downloadBreakpoint) {
      this.createMap();
    }
  }

  createMap() {
    // define mapbox map
    mapboxgl.accessToken = 'undefined';
    // define the map bounds for Texas at the initial zoom and center,
    // these will keep the map bounds centered around Texas. Probably
    // will need to calc an appropriate bounds or initial zoom for all
    // different screen sizes.
    // const texasBounds = [
    //   [-108.83792172606844, 25.535364049344025], // Southwest coordinates
    //   [-89.8448562738755, 36.78883840623598] // Northeast coordinates
    // ]
    const map = new mapboxgl.Map({
        container: 'collection-filter-map', // container id
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: this.props.collectionFilterMapCenter,
        zoom: this.props.collectionFilterMapZoom,
        // maxBounds: texasBounds, // sets texasBounds as max to prevent panning
        interactive: true
    });
    this._map = map;

    this._navControl = new mapboxgl.NavigationControl()
    map.addControl(this._navControl, 'top-left');

    map.on('load', function() {
      // define harris county footprint layer and add it to the map
      const layerData = {
          user_name: 'tnris-flood',
          sublayers: [{
                  sql: `SELECT
                          * FROM area_type
                        WHERE
                          area_type.area_type IN ('county', 'quad');`,
                  cartocss: '{}'
              }],
          maps_api_template: 'https://tnris-flood.carto.com'
      };

      cartodb.Tiles.getTiles(layerData, function (result, error) {
        if (result == null) {
          console.log("error: ", error.errors.join('\n'));
          return;
        }

        const countyTiles = result.tiles.map(function (tileUrl) {
          console.log(tileUrl);
          return tileUrl
            .replace('{s}', 'a')
            .replace(/\.png/, '.mvt');
        });

        map.addSource(
          'county-source',
          { type: 'vector', tiles: countyTiles }
        );

        map.addLayer({
            id: 'county',
            'type': 'fill',
            'source': 'county-source',
            'source-layer': 'layer0',
            'minzoom': 2,
            'maxzoom': 24,
            'paint': {
              'fill-color': 'rgba(100,100,100,0)',
              // 'fill-color': styles[filler],
              // 'fill-opacity': .05,
              // 'fill-outline-color': styles[filler]
            }
        });

        map.addLayer({
            id: 'county-outline',
            'type': 'line',
            'source': 'county-source',
            'source-layer': 'layer0',
            'minzoom': 2,
            'maxzoom': 24,
            'paint': {
              'line-color': 'rgba(100,100,100,1)',
              'line-width': 2,
              'line-opacity': .2
            },
            'filter': ["==", "area_type", "county"]
        });

        map.addLayer({
            id: 'county-selected',
            'type': 'fill',
            'source': 'county-source',
            'source-layer': 'layer0',
            'minzoom': 2,
            'maxzoom': 24,
            'paint': {
              'fill-color': styles[filler],
              'fill-opacity': .7,
              'fill-outline-color': styles[texter]
            },
            'filter': ["==", "area_type_name", ""]
        }, 'county-outline');

        map.addLayer({
            id: 'county-outline-selected',
            'type': 'line',
            'source': 'county-source',
            'source-layer': 'layer0',
            'minzoom': 2,
            'maxzoom': 24,
            'paint': {
              'line-color': 'rgba(0,0,100,1)',
              'line-width': 2,
              'line-opacity': .2
            },
            'filter': ["==", "area_type_name", ""]
        }, 'county-outline');

        map.addLayer({
            id: 'quad-outline',
            'type': 'line',
            'source': 'county-source',
            'source-layer': 'layer0',
            'minzoom': 9,
            'maxzoom': 24,
            'paint': {
              'line-color': 'rgba(100,0,100,1)',
              'line-width': 2,
              'line-opacity': .05
            },
            'filter': ["==", "area_type", "quad"]
          });
      });
    })

    const filler = this.props.theme + "Fill";
    const texter = this.props.theme + "Text";

    // create the draw control and define its functionality
    // update the mapbox draw modes with the rectangle mode
    const modes = MapboxDraw.modes;
    modes.draw_rectangle = DrawRectangle;
    this._draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {'polygon': true, 'trash': true},
      modes: modes,
      userProperties: true,
      styles: [{
          'id': 'gl-draw-polygon-fill-inactive',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
          ],
          'paint': {
            'fill-color': styles[filler],
            'fill-outline-color': styles[texter],
            'fill-opacity': 0.6
          }
        },
        {
          'id': 'gl-draw-polygon-fill-active',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'true'],
            ['==', '$type', 'Polygon']
          ],
          'paint': {
            'fill-color': styles[filler],
            'fill-outline-color': styles[filler],
            'fill-opacity': 0.2
          }
        },
        {
          'id': 'gl-draw-polygon-stroke-inactive',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
          ],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': styles[filler],
            'line-width': 3
          }
        },
        {
          'id': 'gl-draw-polygon-stroke-active',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'true'],
            ['==', '$type', 'Polygon']
          ],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': styles[filler],
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        }
      ]
    });
    this._map.addControl(this._draw, 'top-left');

    // Check if the draw mode is draw_polygon, if so, change it to draw_rectangle.
    // If there are previously drawn features on the map, delete them.
    // We do this so there is only one aoi polygon in the map at a time.
    this._map.on('draw.modechange', (e) => {
      if (e.mode === 'draw_polygon') {
        this._draw.changeMode('draw_rectangle');
        let features = this._draw.getAll();
        if (features.features.length > 1) {
          this._draw.delete(features.features[0].id);
          this.resetTheMap();
        }
      }
    })

    const _this = this;
    console.log(_this._map);
    this._map.on('draw.create', (e) => {
      this.getExtentIntersectedCollectionIds(_this, e.features[0].geometry);
      document.getElementById('map-filter-button').classList.remove('mdc-fab--exited');
    })

    this._map.on('draw.update', (e) => {
      this.props.setCollectionFilterMapAoi({});
      this.props.setCollectionFilterMapFilter([]);
      this.getExtentIntersectedCollectionIds(_this, e.features[0].geometry);
    })

    this._map.on('draw.delete', (e) => {
      this.resetTheMap();
    })

    this._map.on('moveend', function() {
      _this.props.setCollectionFilterMapCenter(_this._map.getCenter());
      _this.props.setCollectionFilterMapZoom(_this._map.getZoom());
    })

    if (this.props.collectionFilterMapFilter.length > 0) {
      if (Object.keys(this.props.collectionFilterMapAoi).length) {
        this._draw.add(this.props.collectionFilterMapAoi);
        this._map.fitBounds(turfExtent(this.props.collectionFilterMapAoi), {padding: 100});
      }
      document.getElementById('map-filter-button').classList.remove('mdc-fab--exited');
      this.disableUserInteraction();
    }

    // Change the cursor to a pointer when it enters a feature in the 'county-extended' layer
  // highlight the county polys on hover if the zoom range is right
  // this._map.on('mouseenter', 'county', (e) => {
  //   this._map.getCanvas().style.cursor = 'pointer';
  //   this._map.setFilter('county-selected', ['==', 'area_type_name', e.features[0].properties.area_type_name]);
  // });

  // Change it back to a karate when the cursor leaves 'county-selected'
  // remove the hover effect on mouseleave
  // this._map.on('mouseleave', 'county', (e) => {
  //   this._map.getCanvas().style.cursor = '';
  //   this._map.setFilter('county-selected', ['==', 'area_type_name', '']);
  // });

    // function getExtentIntersectedCollectionIds(_this, aoiRectangle) {
    //   // get the bounds from the aoi rectangle and query carto
    //   // to find the area_type polygons that intersect this mbr
    //   // and return the collection_ids associated with those areas
    //   let bounds = turfExtent(aoiRectangle); // get the bounds with turf.js
    //   let sql = new cartodb.SQL({user: 'tnris-flood'});
    //   let query = `SELECT
    //                  areas_view.collections
    //                FROM
    //                  area_type, areas_view
    //                WHERE
    //                  area_type.area_type_id = areas_view.area_type_id
    //                AND
    //                  area_type.the_geom && ST_MakeEnvelope(
    //                    ${bounds[2]}, ${bounds[1]}, ${bounds[0]}, ${bounds[3]})`;
    //
    //   sql.execute(query).done(function(data) {
    //     // set up the array of collection_id arrays from the returned
    //     // query object
    //     let collectionIds = data.rows.map(function (obj) {
    //       return obj.collections.split(",");
    //     });
    //     // combine all collection_id arrays into a single array of unique ids
    //     let uniqueCollectionIds = [...new Set([].concat(...collectionIds))];
    //     _this.setState({
    //       mapFilteredCollectionIds: uniqueCollectionIds
    //     });
    //     _this._map.fitBounds(bounds, {padding: 100});
    //     _this.props.setCollectionFilterMapAoi(aoiRectangle);
    //   }).error(function(errors) {
    //     // errors contains a list of errors
    //     console.log("errors:" + errors);
    //   })
    // }

    // if geo filter applied in url on load, execute here on mount
    if (this.props.collectionFilterMapAoi.coordinates) {
      this.getExtentIntersectedCollectionIds(_this, this.props.collectionFilterMapAoi);
      this._draw.add(this.props.collectionFilterMapAoi);
      document.getElementById('map-filter-button').classList.remove('mdc-fab--exited');
      this.disableUserInteraction();
    }


  }

  getExtentIntersectedCollectionIds(_this, aoi) {
    // get the bounds from the aoi rectangle and query carto
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
      _this.setState({
        mapFilteredCollectionIds: uniqueCollectionIds
      });
      _this._map.fitBounds(bounds, {padding: 100});
      _this.props.setCollectionFilterMapAoi(aoi);
    }).error(function(errors) {
      // errors contains a list of errors
      console.log("errors:" + errors);
    })
  }

  enableUserInteraction() {
    // enables panning, rotating, and zooming of the map
    this._map.boxZoom.enable();
    this._map.doubleClickZoom.enable();
    this._map.dragPan.enable();
    this._map.dragRotate.enable();
    this._map.keyboard.enable();
    this._map.scrollZoom.enable();
    this._map.touchZoomRotate.enable();
    this._navControl._compass.disabled = false;
    this._navControl._zoomInButton.disabled = false;
    this._navControl._zoomOutButton.disabled = false;

  }

  disableUserInteraction() {
    // disables panning, rotating, and zooming of the map
    this._map.boxZoom.disable();
    this._map.doubleClickZoom.disable();
    this._map.dragPan.disable();
    this._map.dragRotate.disable();
    this._map.keyboard.disable();
    this._map.scrollZoom.disable();
    this._map.touchZoomRotate.disable();
    this._navControl._compass.disabled = true;
    this._navControl._zoomInButton.disabled = true;
    this._navControl._zoomOutButton.disabled = true;
  }

  resetTheMap() {
    // resets the map filter and aoi objects to empty, enables user
    // interaction controls, and hides the map filter button till
    // it is needed again
    this.props.setCollectionFilterMapAoi({});
    this.props.setCollectionFilterMapFilter([]);
    document.getElementById('map-filter-button').classList.add('mdc-fab--exited');
    this.enableUserInteraction();
  }

  handleFilterButtonClick() {
    // update URL to reflect new sort change
    const prevFilter = this.props.catalogFilterUrl.includes('/catalog/') ?
                       JSON.parse(decodeURIComponent(this.props.catalogFilterUrl.replace('/catalog/', '')))
                       : {};
    const filterObj = {...prevFilter, geo: this.props.collectionFilterMapAoi};

    // sets the collection_ids array in the filter to drive the view
    // and disables/enables the user interaction handlers and navigation controls
    if (this.props.collectionFilterMapFilter.length > 0) {
      this.resetTheMap();
      this._draw.deleteAll();
      delete filterObj['geo'];
    } else {
      this.props.setCollectionFilterMapFilter(this.state.mapFilteredCollectionIds);
      this._map.fitBounds(turfExtent(this.props.collectionFilterMapAoi), {padding: 100});
      this.disableUserInteraction();
    }

    // if map aoi is empty, remove from the url
    if (filterObj['geo'] === {}) {
      delete filterObj['geo'];
    }
    const filterString = JSON.stringify(filterObj);
    // if empty filter settings, use the base home url instead of the filter url
    Object.keys(filterObj).length === 0 ? this.props.setUrl('/') :
      this.props.setUrl('/catalog/' + encodeURIComponent(filterString));
    // log filter change in store
    Object.keys(filterObj).length === 0 ? this.props.logFilterChange('/') :
      this.props.logFilterChange('/catalog/' + encodeURIComponent(filterString));

    // jump back into catalog view regardless of setting or clearing the geo filter
    this.props.setViewCatalog();
  }

  moveToSelectedMapFeature() {
    console.log("function called");
    console.log(this.props.selectedCountyName);
    let county = this._map.querySourceFeatures(
      'county-source',
      {
        sourceLayer: 'layer0',
        filter: [
                  "all",
                  ["==", "area_type", "county"],
                  ["==", "area_type_name", this.props.selectedCountyName]
                ]
      }
    )
    this.getExtentIntersectedCollectionIds(this, county[0]);
    this.props.setCollectionFilterMapMoveMap(false);
    // let featureBounds = turfExtent(county[0]) // get the bounds with turf.js
    // console.log(featureBounds);
    // return featureBounds;
  }

  render() {
    if (this.props.selectedCountyName && this.props.collectionFilterMapMoveMap) {
      // this.moveToSelectedMapFeature();
      this.moveToSelectedMapFeature(this);
    }
    console.log(this.state);
    console.log(this.props);
    if (window.innerWidth <= this.downloadBreakpoint) {
      window.scrollTo(0,0);
      return (
        <div id='collection-filter-map' className='tnris-download-template-download'>
          <div className="tnris-download-template-download__mobile">
            <p>
              In consideration of user experience,
              the filter by geography map has been <strong>disabled</strong> for small browser windows and mobile devices.
            </p>
            <p>
              Please visit this page with a desktop computer or increase the browser window size and refresh
              the page to use the filter by geography tool.
            </p>
          </div>
        </div>
      )
    } else {
      return (
        <div className='collection-filter-map-component'>
          <div id='collection-filter-map'></div>
          <button
            id='map-filter-button'
            className='map-filter-button mdc-fab mdc-fab--extended mdc-fab--exited'
            onClick={this.handleFilterButtonClick}>
            {this.props.collectionFilterMapFilter.length > 0 ? 'clear map filter' : 'set map filter'}
          </button>
          {/*<CollectionFilterMapInstructions />*/}
        </div>
      );
    }
  }
}
