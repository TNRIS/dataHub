import React from 'react'
import CollectionFilterMapInstructions from './CollectionFilterMapInstructions'

import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import turfExtent from 'turf-extent';
// import styles from '../sass/index.scss';

// global sass breakpoint variables to be used in js
import breakpoints from '../sass/_breakpoints.scss'

// the carto core api is a CDN in the app template HTML (not available as NPM package)
// so we create a constant to represent it so it's available to the component
const cartodb = window.cartodb;

export default class CollectionFilterMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapFilteredCollectionIds: this.props.collectionFilterMapFilter,
      countyNames: []
    }
    // bind our map builder and other custom functions
    this.createMap = this.createMap.bind(this);
    this.resetTheMap = this.resetTheMap.bind(this);
    this.handleFilterButtonClick = this.handleFilterButtonClick.bind(this);
    this.getExtentIntersectedCollectionIds =
      this.getExtentIntersectedCollectionIds.bind(this);
    this.moveToSelectedMapFeature = this.moveToSelectedMapFeature.bind(this);
    this.downloadBreakpoint = parseInt(breakpoints.download, 10);
    this.getAreaTypeGeoJson = this.getAreaTypeGeoJson.bind(this);
  }

  componentDidMount() {
    if (this.props.view !== 'geoFilter') {
      this.props.setViewGeoFilter();
    }
    if (window.innerWidth > this.downloadBreakpoint) {
      this.createMap();
    }
  }

  componentDidUpdate() {
    // Disable user interaction if a filter has been set
    const mapElement = document.querySelector('.mapboxgl-canvas');
    const mapControls = document.querySelectorAll('.mapboxgl-ctrl-icon');
    const drawControls = document.querySelectorAll('.mapbox-gl-draw_ctrl-draw-btn');
    if (this.props.collectionFilterMapFilter.length > 0) {
      mapElement.classList.add('disabled-map');
      mapControls.forEach((mapControl) => {
        mapControl.disabled = true;
        mapControl.classList.add('disabled-button');
      })
      drawControls.forEach((drawControl) => {
        drawControl.disabled = true;
        drawControl.classList.add('disabled-button');
      })
    }
    if (this.props.collectionFilterMapSelectedAreaType &&
      this.props.collectionFilterMapMoveMap) {
        // Check if there is an aoi drawn on the map. If so,
        // delete the draw features and continue with the
        // area type selection.
        if (this._draw.getAll().features.length > 0) {
          this._draw.deleteAll();
        }
        // Select the chosen area type and pan to that feature
        // in the map.
        this.getAreaTypeGeoJson(
          this.props.collectionFilterMapSelectedAreaType,
          this.props.collectionFilterMapSelectedAreaTypeName
        )
    }
  }

  componentWillUnmount() {
    this.props.setCollectionFilterMapAoi({});
    this.props.setCollectionFilterMapSelectedAreaType("");
    this.props.setCollectionFilterMapSelectedAreaTypeName("");
    this.props.setCollectionFilterMapCenter({lng: -99.341389, lat: 31.33}); // the center of Texas
    this.props.setCollectionFilterMapZoom(5.3);
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

    // Define custom map control to reset the map to its
    // initial extent
    class NavigateToExtentControl {
      onAdd(map){
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        const button = this._createButton();
        this._container.appendChild(button);
        return this._container;
      }
      onRemove(){
        this._container.parentNode.removeChild(this.container);
        this._map = undefined;
      }

      _createButton() {
        const el = window.document.createElement('button')
        el.className = 'mapboxgl-ctrl-icon material-icons navigate-to-extent';
        el.type = 'button';
        el.title = 'Reset extent to statewide';
        el.setAttribute('aria-label', 'Reset extent to statewide');
        el.textContent = 'home';
        el.addEventListener('click',
          (e) => {
            this._map.easeTo({
              center: [-99.341389, 31.33],
              zoom: 5.3,
              pitch: 0,
              bearing: 0
            });
            e.stopPropagation();
          },
          false
        )
        return el;
      }
    }

    // Instantiate the custom navigation control and add it to our map
    const navigateToExtentControl = new NavigateToExtentControl();
    map.addControl(navigateToExtentControl, 'top-left');

    // Define the color to use to show selected areas on the map
    const selectedAreaColor = '#1E8DC1';

    // set true to turn on tile boundaires for debugging
    map.showTileBoundaries = true;

    map.on('load', () => {
      // define area type layers and add to the map
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

        const areaTypeTiles = result.tiles.map(function (tileUrl) {
          return tileUrl
            .replace('{s}', 'a')
            .replace(/\.png/, '.mvt');
        });

        map.addSource(
          'area-type-source',
          { type: 'vector', tiles: areaTypeTiles }
        );

        map.addLayer({
          "id": "county-labels",
          "type": "symbol",
          "source": "area-type-source",
          'source-layer': 'layer0',
          "layout": {
          "text-field": ["get", "area_type_name"],
          // "text-variable-anchor": ["top", "bottom", "left", "right"],
          // "text-radial-offset": 0.5,
          // "text-justify": "auto",
            'text-size': {
                "base": 1,
                "stops": [
                    [12, 12],
                    [16, 16]
                ]
            },
            "text-padding": 3,
            "text-letter-spacing": 0.1,
            "text-max-width": 7,
            // "text-transform": "uppercase",
            "text-allow-overlap": true
        },
        "paint": {
            "text-color": "#555",
            "text-halo-color": "hsl(0, 0%, 100%)",
            "text-halo-width": 1.5,
            "text-halo-blur": 1
        },
        'filter': ["==", ["get", "area_type"], "county"]
        });

        // map.addLayer({
        //   "id": "quad-labels",
        //   "type": "symbol",
        //   "source": "area-type-source",
        //   'source-layer': 'layer0',
        //   "layout": {
        //   "text-field": ["get", "area_type_name"],
        //   "text-variable-anchor": ["top", "bottom", "left", "right"],
        //   "text-radial-offset": 0.5,
        //   "text-justify": "auto",
        //   // "icon-image": ["concat", ["get", "icon"], "-15"]
        // },
        // 'filter': ["==", ["get", "area_type"], "quad"]
        // });

        // Add the area type selected outline layer to the map.
        // This layer is used to highlight te outline of the user
        // selected area type.
        map.addLayer({
            'id': 'area-type-outline-selected',
            'type': 'line',
            'source': 'area-type-source',
            'source-layer': 'layer0',
            'minzoom': 2,
            'maxzoom': 24,
            'paint': {
              'line-color': selectedAreaColor,
              'line-width': 4,
              'line-opacity': 1
            },
            'filter': [
              "all",
              ["==", ["get", "area_type"], ""],
              ["==", ["get", "area_type_name"], ""]
            ]
        }, 'boundary_country_inner');

        // Add the county outlines to the map
        map.addLayer({
            'id': 'county-outline',
            'type': 'line',
            'source': 'area-type-source',
            'source-layer': 'layer0',
            'minzoom': 2,
            'maxzoom': 24,
            'paint': {
              'line-color': 'rgba(100,100,100,1)',
              'line-width': 2,
              'line-opacity': .2
            },
            'filter': ["==", ["get", "area_type"], "county"]
        }, 'area-type-outline-selected');

        // Add the quad outlines to the map
        map.addLayer({
            'id': 'quad-outline',
            'type': 'line',
            'source': 'area-type-source',
            'source-layer': 'layer0',
            'minzoom': 7.5,
            'maxzoom': 24,
            'paint': {
              'line-color': 'rgba(100,0,100,1)',
              'line-width': 2,
              'line-opacity': .05
            },
            'filter': ["==", ["get", "area_type"], "quad"]
          }, 'county-outline');

          map.addLayer({
            "id": "county",
            "type": "fill",
            "source": 'area-type-source',
            "source-layer": 'layer0',
            "paint": {
                "fill-color": "transparent"
            },
            'filter': ["==", ["get", "area_type"], "county"]
        }, 'quad-outline');
      });
    })

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
            'fill-color': '#1E8DC1',
            'fill-outline-color': selectedAreaColor,
            'fill-opacity': 0
          }
        },
        {
          'id': 'gl-draw-polygon-fill-active',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'true'],
            ['==', '$type', 'Polygon']
          ],
          'paint': {
            'fill-color': '#1E8DC1',
            'fill-outline-color': selectedAreaColor,
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
            'line-color': selectedAreaColor,
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
            'line-color': selectedAreaColor,
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
      if (this.props.collectionFilterMapSelectedAreaType) {
        this.resetTheMap();
      }
      if (e.mode === 'draw_polygon') {
        this._draw.changeMode('draw_rectangle');
        let features = this._draw.getAll();
        if (features.features.length > 1) {
          this._draw.delete(features.features[0].id);
          this.resetTheMap();
        }
      }
    })

    this._map.on('draw.create', (e) => {
      this.getExtentIntersectedCollectionIds(this, 'draw', e.features[0].geometry);
      document.getElementById('map-filter-button').classList.remove('mdc-fab--exited');
    })

    this._map.on('draw.update', (e) => {
      this.props.setCollectionFilterMapAoi({});
      this.props.setCollectionFilterMapFilter([]);
      this.getExtentIntersectedCollectionIds(this, 'draw', e.features[0].geometry);
    })

    this._map.on('draw.delete', (e) => {
      this.resetTheMap();
    })

    this._map.on('moveend', () => {
      let countyFeatures = this._map.queryRenderedFeatures({
        layers: ['county']
      });
      console.log(countyFeatures);
      this.props.setCollectionFilterMapCenter(this._map.getCenter());
      this.props.setCollectionFilterMapZoom(this._map.getZoom());
    })

    // if the aoi is set in the app's state on map load,
    // add it to the map and fit the map's bounds to the
    // aoi extent.
    this._map.on('load', () => {
      if (Object.keys(this.props.collectionFilterMapAoi).length > 0) {
        if (this.props.collectionFilterMapAoi.aoiType === 'draw') {
          this._draw.add(this.props.collectionFilterMapAoi.payload);
        } else {
          // We have to wait for the map's style to load, then check
          // for the area type outline layer. Once it is loaded we
          // set the filter to show the highlighted area.
          this._map.on('styledata', () => {
            if (this._map.getLayer('area-type-outline-selected')) {
              this._map.setFilter(
                'area-type-outline-selected',
                [
                  "all",
                  [
                    "==",
                    ["get", "area_type"],
                    this.props.collectionFilterMapSelectedAreaType
                  ],
                  [
                    "==",
                    ["get", "area_type_name"],
                    this.props.collectionFilterMapSelectedAreaTypeName
                  ]
                ]
              );
            }
          })
        }
        this._map.fitBounds(turfExtent(
          this.props.collectionFilterMapAoi.payload
        ), {padding: 100});
        document.getElementById(
          'map-filter-button'
        ).classList.remove('mdc-fab--exited');
      }
    })
  }

  resetTheMap() {
    // resets the map filter and aoi objects to empty, enables user
    // interaction controls, and hides the map filter button till
    // it is needed again
    this.props.setCollectionFilterMapAoi({});
    this.props.setCollectionFilterMapFilter([]);
    // this.props.setCollectionFilterMapCenter({lng: -99.341389, lat: 31.33}); // the center of Texas
    // this.props.setCollectionFilterMapZoom(5.3);
    this._draw.deleteAll();
    if (this.props.collectionFilterMapSelectedAreaType) {
      this.props.setCollectionFilterMapSelectedAreaType("");
      this.props.setCollectionFilterMapSelectedAreaTypeName("");
      this._map.setFilter(
        'area-type-outline-selected',
        [
          "all",
          ["==", ["get", "area_type"], ""],
          ["==", ["get", "area_type_name"], ""]
        ]
      );
    }
    // Enable user interaction once the filter has been cleared
    const mapElement = document.querySelector('.mapboxgl-canvas');
    const mapControls = document.querySelectorAll('.mapboxgl-ctrl-icon');
    const drawControls = document.querySelectorAll('.mapbox-gl-draw_ctrl-draw-btn');
    mapElement.classList.remove('disabled-map');
    mapControls.forEach((mapControl) => {
      mapControl.disabled = false;
      mapControl.classList.remove('disabled-button');
    })
    drawControls.forEach((drawControl) => {
      drawControl.disabled = false;
      drawControl.classList.remove('disabled-button');
    })

    document.getElementById('map-filter-button').classList.add('mdc-fab--exited');
  }

  handleFilterButtonClick() {
    // update URL to reflect new filter change
    const prevFilter = this.props.catalogFilterUrl.includes('/catalog/') ?
                       JSON.parse(
                         decodeURIComponent(
                           this.props.catalogFilterUrl.replace('/catalog/', '')
                         )
                       ) : {};
    let filterObj;
    if (this.props.collectionFilterMapAoi.aoiType === 'draw') {
      filterObj = {
        ...prevFilter,
        geo: this.props.collectionFilterMapAoi.payload
      };
    } else {
      filterObj = {
        ...prevFilter,
        geo: {'county': this.props.collectionFilterMapSelectedAreaTypeName}
      };
    }

    if (this.props.collectionFilterMapFilter.length > 0) {
      this.resetTheMap();
      delete filterObj['geo'];
      // if empty filter settings, use the base home url instead of the filter url
      // and log filter change in store
      Object.keys(filterObj).length === 0 ? this.props.logFilterChange('/') :
        this.props.logFilterChange(
          '/catalog/' + encodeURIComponent(JSON.stringify(filterObj))
        );
    } else {
      this.props.setCollectionFilterMapFilter(
        this.state.mapFilteredCollectionIds
      );
      // if empty filter settings, use the base home url instead of the filter url
      Object.keys(filterObj).length === 0 ? this.props.setUrl('/') :
        this.props.setUrl(
          '/catalog/' + encodeURIComponent(JSON.stringify(filterObj))
        );
      // log filter change in store
      Object.keys(filterObj).length === 0 ? this.props.logFilterChange('/') :
        this.props.logFilterChange(
          '/catalog/' + encodeURIComponent(JSON.stringify(filterObj))
        );

      this.props.setViewCatalog();
    }
  }

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
      this.moveToSelectedMapFeature(areaType, areaTypeName, areaTypeGeoJson);
    })
  }

  moveToSelectedMapFeature(areaType, areaTypeName, areaTypeGeoJson) {
    this.getExtentIntersectedCollectionIds(this, areaType, areaTypeGeoJson);
    this._map.setFilter(
      'area-type-outline-selected',
      [
        "all",
        ["==", "area_type", areaType],
        ["==", "area_type_name", areaTypeName]
      ]
    );
    document.getElementById('map-filter-button').classList.remove('mdc-fab--exited');
    this.props.setCollectionFilterMapMoveMap(false);
  }

  getExtentIntersectedCollectionIds(_this, aoiType, aoi) {
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
      _this.setState({
        mapFilteredCollectionIds: uniqueCollectionIds
      });
      _this._map.fitBounds(bounds, {padding: 80});
      _this.props.setCollectionFilterMapAoi({aoiType: aoiType, payload: aoi});
    }).error(function(errors) {
      // errors contains a list of errors
      console.log("errors:" + errors);
    })
  }

  render() {
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
          <CollectionFilterMapInstructions />
        </div>
      );
    }
  }
}