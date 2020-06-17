import React from 'react'
import ReactDOM from 'react-dom'
import BasemapSelector from './BasemapSelector'
import CollectionFilterMapInstructions from './CollectionFilterMapInstructions'
import GeoSearcher from './GeoSearcher'

import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode'
import turfExtent from 'turf-extent'
import styles from '../sass/index.scss'
// below commented out till we verify dynamic labels work again
// import intersect from '@turf/intersect';
// import polylabel from 'polylabel';
// import parse from 'wellknown';
// import styles from '../sass/index.scss';

// global sass breakpoint variables to be used in js
import breakpoints from '../sass/_breakpoints.scss'

// the carto core api is a CDN in the app template HTML (not available as NPM package)
// so we create a constant to represent it so it's available to the component
const cartodb = window.cartodb;
const countyLabelCentroids = require('../constants/countyCentroids.geojson.json');
const quadLabelCentroids = require('../constants/quadCentroids.geojson.json');

// commented out till we can verify dynamic labels work again
// const dynamicCountyCentroid = {};
// dynamicCountyCentroid.type = "FeatureCollection";
// dynamicCountyCentroid.features = [];

export default class CollectionFilterMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapFilteredCollectionIds: this.props.collectionFilterMapFilter
    }
    // bind our map builder and other custom functions
    this.createMap = this.createMap.bind(this);
    this.resetTheMap = this.resetTheMap.bind(this);
    this.handleFilterButtonClick = this.handleFilterButtonClick.bind(this);
    this.getExtentIntersectedCollectionIds =
    this.getExtentIntersectedCollectionIds.bind(this);
    // this.moveToSelectedMapFeature = this.moveToSelectedMapFeature.bind(this);
    this.downloadBreakpoint = parseInt(breakpoints.download, 10);
    // this.getAreaTypeGeoJson = this.getAreaTypeGeoJson.bind(this);
    this.toggleBasemaps = this.toggleBasemaps.bind(this);
    // below commented out till we can verify dynamic labels work again
    // this.dynamicLabels = this.dynamicLabels.bind(this);
    // this.groupBy = this.groupBy.bind(this);
    // this.getVisualCenter = this.getVisualCenter.bind(this);
    // this.cleanArray = this.cleanArray.bind(this);
  }

  componentDidMount() {
    if (this.props.view !== 'geoFilter') {
      this.props.setViewGeoFilter();
    }
    if (window.innerWidth >= this.downloadBreakpoint) {
      this.createMap();
    }
  }

  componentDidUpdate() {
    console.log('updated')
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
    // if (this.props.collectionFilterMapSelectedAreaType &&
    //   this.props.collectionFilterMapMoveMap) {
    //     // Check if there is an aoi drawn on the map. If so,
    //     // delete the draw features and continue with the
    //     // area type selection.
    //     if (this._draw.getAll().features.length > 0) {
    //       this._draw.deleteAll();
    //     }
    //     // Select the chosen area type and pan to that feature
    //     // in the map.
    //     if (this.props.collectionFilterMapSelectedAreaTypeName === '') {
    //       this.resetTheMap();
    //     } else {
    //       this.getAreaTypeGeoJson(
    //         this.props.collectionFilterMapSelectedAreaType,
    //         this.props.collectionFilterMapSelectedAreaTypeName
    //       )
    //     }
    // }
  }

  componentWillUnmount() {
    this.props.setCollectionFilterMapAoi({});
    this.props.setCollectionFilterMapSelectedAreaType("");
    this.props.setCollectionFilterMapSelectedAreaTypeName("");
    this.props.setCollectionFilterMapCenter({lng: -99.341389, lat: 31.33}); // the center of Texas
    this.props.setCollectionFilterMapZoom(5.3);
  }

  toggleBasemaps (e, map, visible) {
    map.setLayoutProperty('satellite-basemap-layer', 'visibility', visible);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // returns layer properties based on feature type for the
  // geosearcher 'selected-feature' layer
  getGeoSearcherLayerProps = (featureType) => {
    if (featureType === 'Point' || featureType === 'MultiPoint') {
      return {
        'type': 'circle',
        'paint': {
          'circle-radius': 8,
          'circle-color': '#f08',
          'circle-opacity': 0.3
        }
      };
    } else if (
      featureType === 'Polygon' || featureType === 'MultiPolygon') {
        return {
          'type': 'fill',
          'paint': {
            'fill-color': '#f08',
            'fill-opacity': 0.2,
            'fill-outline-color': '#f08'
          // 'type': 'line',
          // 'paint': {
          //   'line-color': '#f08',
          //   'line-width': 3,
          //   'line-opacity': 0.6
            // 'line-color': styles['selectedFeature'],
            // 'line-width': 3,
            // 'line-opacity': 1
          }             
        };
    } else if (
      featureType === 'LineString' || featureType === 'MultiLinestring') {
        return {
          'type': 'line',
          'paint': {
            // 'line-color': '#f08',
            // 'line-width': 6,
            // 'line-opacity': 0.3
            'line-color': styles['selectedFeature'],
            'line-width': 3,
            'line-opacity': 1
          }
        };
    }
  }
  
  // adds the selected feature source data to the map
  addGeoSearcherSource = (selectedFeature) => {
    const selectedFeatureSource = this._map.getSource(
      'selected-feature');
    
    if (typeof selectedFeatureSource === 'undefined') {
      this._map.addSource('selected-feature', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            selectedFeature
          ]
        }
      });
    } else {
      selectedFeatureSource.setData({
        'type': 'FeatureCollection',
        'features': [
          selectedFeature
        ]
      });
    }
  }
  
  // adds the selected feature layer to the map
  addGeoSearcherLayer = (selectedFeature) => {
    // get the selected feature layer from the map
    const selectedFeatureLayer = this._map.getLayer('selected-feature');
    console.log(selectedFeatureLayer)
    // selected feature layer definition
    const layerObject = {
      'id': 'selected-feature',
      'type': this.getGeoSearcherLayerProps(
        selectedFeature.geometry.type).type,
      'source': 'selected-feature',
      'paint': this.getGeoSearcherLayerProps(
        selectedFeature.geometry.type).paint
    }
  
    if (this._map.getSource('selected-feature')) {
      if (this._map.getLayer('quad-outline')) {
        // check if the selected feature layer is in the map
        // and add it. if not remove the layer
        // and add a new one.
        if (typeof selectedFeatureLayer === 'undefined') {
          this._map.addLayer(layerObject, 'quad-outline')
        } else {
          this._map.removeLayer('selected-feature');
          this._map.addLayer(layerObject, 'quad-outline')
        }
      }
    }
  }
  
  // removes the 'selected-feature' layer from the map
  removeGeoSearcherLayer = () => {
    const selectedFeatureLayer = this._map.getLayer('selected-feature');
    if (typeof selectedFeatureLayer !== 'undefined') {
      this._map.removeLayer('selected-feature');
    }
  }
  
  // adds the GeoSearcher's 'selected-feature' layer to the map
  // and moves the map to show the feature
  handleGeoSearcherChange = (selectedFeature) => {
    if (selectedFeature !== null) {
      this.addGeoSearcherSource(selectedFeature)
      this.addGeoSearcherLayer(selectedFeature)
      this.getExtentIntersectedCollectionIds(this, 'osm', selectedFeature)
    }
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  createMap() {
    // define mapbox map
    mapboxgl.accessToken = 'undefined';
    const map = new mapboxgl.Map({
      container: 'collection-filter-map', // container id
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: this.props.collectionFilterMapCenter,
      zoom: this.props.collectionFilterMapZoom,
      maxZoom: 18,
      interactive: true
    });
    this._map = map;

    this._navControl = new mapboxgl.NavigationControl({
      showCompass: false
    });
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
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

    // set true to turn on tile boundaires for debugging
    // map.showTileBoundaries = true;

    //
    // START COUNTY AND QUAD REFERENCE LAYERS
    //
    map.on('load', () => {
      // define area type layers and add to the map
      const areaTypeLayerData = {
        user_name: 'tnris-flood',
        sublayers: [{
          sql: `SELECT
                  the_geom_webmercator,
                  area_type,
                  area_type_name,
                  ST_AsText(ST_Centroid(the_geom)) as centroid
                FROM
                  area_type
                WHERE
                  area_type IN ('county', 'quad');`,
          cartocss: '{}'
        }],
        maps_api_template: 'https://tnris-flood.carto.com'
      };

      cartodb.Tiles.getTiles(areaTypeLayerData, function (result, error) {
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
            'line-color': styles['selectedFeature'],
            'line-width': 3,
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
            'line-color': styles['boundaryOutline'],
            'line-width': 1.5,
            'line-opacity': .4
          },
          'filter': ["==", ["get", "area_type"], "county"]
        }, 'area-type-outline-selected');

        // Add the quad outlines to the map
        map.addLayer({
          'id': 'quad-outline',
          'type': 'line',
          'source': 'area-type-source',
          'source-layer': 'layer0',
          'minzoom': 9,
          'maxzoom': 24,
          'paint': {
            'line-color': 'rgba(139,69,19,1)',
            'line-width': 1.5,
            'line-opacity': .05
          },
          'filter': ["==", ["get", "area_type"], "quad"]
        }, 'county-outline');

        // These are the source and layer for the map's dynamic
        // labels. They are commented out because they were causing
        // the app to lock up for unknown reasons, 02/12/2020. Leave
        // unused until we can verify it is working again. The other
        // piece to this is commented out below in the map methods within
        // the map's on moveend method.

        // map.addLayer({
        //   "id": "county",
        //   "type": "fill",
        //   "source": 'area-type-source',
        //   "source-layer": 'layer0',
        //   'minzoom': 2,
        //   'maxzoom': 24,
        //   "paint": {
        //       "fill-color": "transparent"
        //   },
        //   'filter': ["==", ["get", "area_type"], "county"]
        // }, 'quad-outline');

        // map.addSource('dynamic-county-centroid', {
        //   type: 'geojson',
        //   data: dynamicCountyCentroid
        // });
        //
        // map.addLayer({
        //   "id": "dynamic-county-label",
        //   "type": "symbol",
        //   "source": "dynamic-county-centroid",
        //   'minzoom': 6,
        //   'maxzoom': 24,
        //   "layout": {
        //       'text-field': ["get", "area_type_name"],
        //       'text-size': {
        //           "base": 1,
        //           "stops": [
        //               [6, 6],
        //               [8, 10],
        //               [10, 12],
        //               [16, 16]
        //           ]
        //       },
        //       "text-padding": 3,
        //       "text-letter-spacing": 0.1,
        //       "text-max-width": 7,
        //       "text-transform": "uppercase",
        //       "text-allow-overlap": true
        //   },
        //   "paint": {
        //       "text-color": "#555",
        //       "text-halo-color": "hsl(0, 0%, 100%)",
        //       "text-halo-width": 1.5,
        //       "text-halo-blur": 1
        //   }
        // });

        map.addSource("county-centroid", {
          "type": "geojson",
          "data": countyLabelCentroids
        });

        map.addSource("quad-centroid", {
          "type": "geojson",
          "data": quadLabelCentroids
        });

        map.addLayer({
          "id": "county-label",
          "type": "symbol",
          "source": "county-centroid",
          'minzoom': 6,
          'maxzoom': 24,
          "layout": {
            "text-field": ["get", "area_type_name"],
            "text-justify": "auto",
            "text-size": {
              "base": 1,
              "stops": [
                [6, 6],
                [8, 10],
                [10, 12],
                [16, 18]
              ]
            },
            "text-padding": 3,
            "text-letter-spacing": 0.1,
            "text-max-width": 7,
            "text-transform": "uppercase",
            "text-allow-overlap": true
          },
          "paint": {
            "text-color": "#555",
            "text-halo-color": "hsl(0, 0%, 100%)",
            "text-halo-width": 1.5,
            "text-halo-blur": 1
          }
        });

        map.addLayer({
          "id": "quad-label",
          "type": "symbol",
          "source": "quad-centroid",
          'minzoom': 9,
          'maxzoom': 24,
          "layout": {
            "text-field": ["get", "area_type_name"],
            "text-size": {
              "base": 1,
              "stops": [
                [9, 8.5],
                [10, 10],
                [16, 16]
              ]
            },
            "text-padding": 3,
            "text-letter-spacing": 0.1,
            "text-max-width": 7,
            "text-allow-overlap": true,
            "text-rotate": 315,
          },
          "paint": {
            "text-color": "rgb(139,69,19)",
            "text-opacity": .4,
            "text-halo-color": "hsl(0, 0%, 100%)",
            "text-halo-width": 1,
            "text-halo-blur": 1
          }
        }, "county-outline");
      });
    });
    //
    // END COUNTY AND QUAD REFERENCE LAYER
    //

    //
    // START BASEMAP SELECTOR & INSTRUCTIONS BUTTONS
    //
    // class for custom map controls used below
    // *** event handler is commented out but might be useful for future new controls ***
    class ButtonControl {
      constructor({
        id = "",
        className = "",
        title = ""
        // eventHandler = ""
      }) {
        this._id = id;
        this._className = className;
        this._title = title;
        // this._eventHandler = eventHandler;
      }
      onAdd(map){
        this._btn = document.createElement("button");
        this._btn.id = this._id;
        this._btn.className = this._className;
        this._btn.type = "button";
        this._btn.title = this._title;
        // this._btn.onclick = this._eventHandler;

        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
        this._container.appendChild(this._btn);

        return this._container;
      }
      onRemove() {
        this._container.parentNode.removeChild(this._container);
      }
    }
    // custom control variable
    const ctrlMenu = new ButtonControl({
      id: 'basemap-menu',
      className: 'tnris-basemap-menu',
      title: 'Basemap Selector'
    });
    // add custom control to map
    if (!document.querySelector('.tnris-basemap-menu')) {
      map.addControl(ctrlMenu, 'top-right');
    }
    const ctrlMenuNode = document.querySelector('#basemap-menu');
    // reset layer menu in case of component update
    if (ctrlMenuNode) {
      while (ctrlMenuNode.firstChild) {
        ctrlMenuNode.removeChild(ctrlMenuNode.firstChild);
      }
    }
    // add control containers
    const basemapSelectorContainer = document.createElement('div');
    basemapSelectorContainer.id = 'basemap-selector-container';
    ctrlMenuNode.appendChild(basemapSelectorContainer);
    // add basemap selector component to container
    ReactDOM.render(<BasemapSelector map={map} handler={this.toggleBasemaps} />, basemapSelectorContainer);
    
    // custom control variable
    const instrMenu = new ButtonControl({
      id: 'instruction-menu',
      className: 'tnris-instruction-menu',
      title: 'Instructions'
    });
    // add custom control to map
    if (!document.querySelector('.tnris-instruction-menu')) {
      map.addControl(instrMenu, 'top-right');
    }
    const instrMenuNode = document.querySelector('#instruction-menu');
    // reset instruction menu in case of component update
    if (instrMenuNode) {
      while (instrMenuNode.firstChild) {
        instrMenuNode.removeChild(instrMenuNode.firstChild);
      }
    }
    const instructionsContainer = document.createElement('div');
    instructionsContainer.id = 'instructions-container';
    instrMenuNode.appendChild(instructionsContainer);
    // add instructions component to container
    ReactDOM.render(<CollectionFilterMapInstructions />, instructionsContainer);
    //
    // END BASEMAP SELECTOR & INSTRUCTIONS BUTTONS
    //

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
            'fill-color': styles['selectedFeature'],
            'fill-outline-color': styles['selectedFeature'],
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
            'fill-color': styles['selectedFeature'],
            'fill-outline-color': styles['selectedFeature'],
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
            'line-color': styles['selectedFeature'],
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
            'line-color': styles['selectedFeature'],
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
      // get the draw feature's geojson object
      const aoi = e.features[0]
      // add the feature's bounding box to the geojson object
      aoi.bbox = turfExtent(aoi.geometry)

      this.getExtentIntersectedCollectionIds(this, 'draw', e.features[0])
      document.getElementById('map-filter-button').classList.remove('mdc-fab--exited')
    })

    this._map.on('draw.update', (e) => {
      console.log('draw-update')
      // get the draw feature's geojson object
      const aoi = e.features[0]
      // add the feature's bounding box to the geojson object
      aoi.bbox = turfExtent(aoi.geometry)

      // this.props.setCollectionFilterMapAoi({});
      this.props.setCollectionFilterMapFilter([]);
      this.getExtentIntersectedCollectionIds(this, 'draw', e.features[0]);
    })

    this._map.on('draw.delete', (e) => {
      this.resetTheMap();
    })

    this._map.on('moveend', () => {
      // commented out till we can verify dynamic labels work again
      // let tileLoad = setInterval( () => {
      //     if (this._map.loaded()) {
      //         this.dynamicLabels(this._map);
      //         clearInterval(tileLoad);
      //     }
      // }, 300);
      this.props.setCollectionFilterMapCenter(this._map.getCenter());
      this.props.setCollectionFilterMapZoom(this._map.getZoom());
    })

    // if the aoi is set in the app's state on map load,
    // add it to the map and fit the map's bounds to the
    // aoi extent.
    this._map.on('load', () => {
      if (this.props.collectionFilterMapFilter.length > 0) {
        
      }

      if (Object.keys(this.props.collectionFilterMapAoi).length > 0) {
        if (this.props.collectionFilterMapAoi.aoiType === 'draw') {
          console.log('trying to add the drawing')
          this._draw.add(this.props.collectionFilterMapAoi.payload);
        } 
        
        // else if (this.props.collectionFilterMapAoi.aoiType === 'osm') {
        //   this._map.on('sourcedata', () => {
        //     this.addGeoSearcherSource(this.props.collectionFilterMapAoi.payload)
        //     // this.addGeoSearcherLayer(this.props.collectionFilterMapAoi.payload)
        //   })
        // } 
        
        else {
          // this.addGeoSearcherSource(this.props.collectionFilterMapAoi.payload)
          // this.addGeoSearcherLayer(this.props.collectionFilterMapAoi.payload)
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

  // commented out till we can verify dunamic labels work again
  // Handles dynamic labeling of counties whose centroids fall outside
  // of the current map extent. Removes duplicate county labels at tile
  // boundaries and determines the best placement of a single label
  // when the map extent changes.
  // dynamicLabels(map) {
  //   dynamicCountyCentroid.features = [];
  //   const countyFeatures = map.queryRenderedFeatures({
  //     layers: ['county']
  //   });
  //
  //   const mapSW = map.getBounds()._sw;
  //   const mapNE = map.getBounds()._ne;
  //
  //   const mapViewBound = {
  //     type: "Feature",
  //     geometry: {
  //       type: "Polygon",
  //       coordinates: [
  //         [
  //           [mapSW.lng, mapSW.lat],
  //           [mapSW.lng, mapNE.lat],
  //           [mapNE.lng, mapNE.lat],
  //           [mapNE.lng, mapSW.lat],
  //           [mapSW.lng, mapSW.lat]
  //         ]
  //       ]
  //     }
  //   };
  //
  //   const visualCenterList = [];
  //   const fixedLabelFilter = ["!in", "area_type_name"];
  //   const counties = this.groupBy(countyFeatures, countyFeature => countyFeature.properties.area_type_name);
  //   counties.forEach( (value, key) => {
  //     let lngOfCentroid = parse(value[0].properties.centroid).coordinates[0];
  //     let latOfCentroid = parse(value[0].properties.centroid).coordinates[1];
  //     if (lngOfCentroid <= mapSW.lng || lngOfCentroid >= mapNE.lng || latOfCentroid <= mapSW.lat || latOfCentroid >= mapNE.lat) {
  //       fixedLabelFilter.push(key);
  //       let visualCenter = value.map(obj => this.getVisualCenter(obj, mapViewBound));
  //       if (this.cleanArray(visualCenter).length) {
  //           visualCenterList.push(this.cleanArray(visualCenter));
  //       }
  //     }
  //   });
  //   visualCenterList.map(obj => {
  //     const coordinatesList = [];
  //     obj.forEach( (feature) => {
  //       coordinatesList.push(feature.geometry.coordinates);
  //     });
  //     const center = this.getCenter(coordinatesList);
  //     const countyCenterFeature = {
  //       type: "Feature",
  //       geometry: {
  //         type: "Point",
  //         coordinates: center
  //       },
  //       properties: {
  //         area_type_name: obj[0].properties.area_type_name,
  //       }
  //     };
  //     dynamicCountyCentroid.features.push(countyCenterFeature);
  //     return obj;
  //   });
  //   map.setFilter("county-label", fixedLabelFilter);
  //   map.getSource('dynamic-county-centroid').setData(dynamicCountyCentroid);
  // }
  //
  // // clean method to remove undefined from an array
  // cleanArray(array) {
  //   for (let i = 0, n = array.length; i < n; i++) {
  //     if (!array[i]) {
  //       array.splice(i, 1);
  //       i--;
  //     }
  //   }
  //   return array;
  // }
  //
  // // groups the features by county
  // groupBy(list, keyGetter) {
  //   const map = new Map();
  //   list.forEach(function(item) {
  //     let key = keyGetter(item);
  //     let collection = map.get(key);
  //     if (!collection) {
  //       map.set(key, [item]);
  //     } else {
  //       collection.push(item);
  //     }
  //   });
  //   return map;
  // }
  //
  // // Get the visual center from each county sliver after
  // // intersecting the rendered features with the map bounds.
  // // Returns a single point to account for multiple county
  // // features at tile boundaries.
  // getVisualCenter(feature, mapViewBound) {
  //   if (feature.geometry.type === "Polygon") {
  //     const intersection = intersect(mapViewBound, feature.geometry);
  //     if (intersection) {
  //       const visualCenter = {
  //         type: "Feature",
  //         geometry: {
  //           type: "Point",
  //           coordinates: []
  //         },
  //         properties: {}
  //       };
  //       if(intersection.geometry.coordinates.length > 1) {
  //         const intersections = [];
  //         intersection.geometry.coordinates.forEach(
  //           (coordinate) => {
  //             intersections.push(polylabel(coordinate));
  //           }
  //         );
  //         visualCenter.geometry.coordinates = this.getCenter(
  //           intersections
  //         );
  //       } else {
  //         visualCenter.geometry.coordinates = polylabel(
  //           intersection.geometry.coordinates
  //         );
  //       }
  //       visualCenter.properties.area_type_name = feature.properties.area_type_name;
  //       return visualCenter;
  //     }
  //   }
  // }
  //
  // // get the center of a coordinates list
  // getCenter(coordinates) {
  //   const lngList = [];
  //   const latList = [];
  //   coordinates.map(coordinate => {
  //     lngList.push(coordinate[0]);
  //     latList.push(coordinate[1]);
  //     return coordinate;
  //   });
  //   const meanLng = lngList.reduce((p,c) => p + c, 0) / lngList.length;
  //   const meanLat = latList.reduce((p,c) => p + c, 0) / latList.length;
  //   return [meanLng, meanLat];
  // }

  resetTheMap() {
    // resets the map filter and aoi objects to empty, enables user
    // interaction controls, and hides the map filter button till
    // it is needed again
    this.props.setCollectionFilterMapAoi({});
    this.props.setCollectionFilterMapFilter([]);
    this._draw.deleteAll();
    if (this.props.collectionFilterMapSelectedAreaType) {
      this.props.setCollectionFilterMapSelectedAreaType("");
      this.props.setCollectionFilterMapSelectedAreaTypeName("");
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

  // getAreaTypeGeoJson(areaType, areaTypeName) {
  //   let sql = new cartodb.SQL({user: 'tnris-flood'});
  //   let query = `SELECT row_to_json(fc)
  //                FROM (
  //                  SELECT
  //                    'FeatureCollection' AS "type",
  //                    array_to_json(array_agg(f)) AS "features"
  //                  FROM (
  //                    SELECT
  //                      'Feature' AS "type",
  //                        ST_AsGeoJSON(area_type.the_geom) :: json AS "geometry",
  //                        (
  //                          SELECT json_strip_nulls(row_to_json(t))
  //                          FROM (
  //                            SELECT
  //                              area_type.area_type_name
  //                          ) t
  //                          ) AS "properties"
  //                    FROM area_type
  //                    WHERE
  //                      area_type.area_type_name = '${areaTypeName}' AND
  //                      area_type.area_type = '${areaType}'
  //                  ) as f
  //                ) as fc`;

  //   sql.execute(query).done( (data) => {
  //     let areaTypeGeoJson = data.rows[0].row_to_json;
  //     this.moveToSelectedMapFeature(areaType, areaTypeName, areaTypeGeoJson);
  //   })
  // }

  // moveToSelectedMapFeature(areaType, areaTypeName, areaTypeGeoJson) {
  //   this.getExtentIntersectedCollectionIds(this, areaType, areaTypeGeoJson);
  //   this._map.setFilter(
  //     'area-type-outline-selected',
  //     [
  //       "all",
  //       ["==", "area_type", areaType],
  //       ["==", "area_type_name", areaTypeName]
  //     ]
  //   );
  //   document.getElementById('map-filter-button').classList.remove('mdc-fab--exited');
  //   this.props.setCollectionFilterMapMoveMap(false);
  // }

  // getExtentIntersectedCollectionIds(_this, aoiType, aoi) {
  //   // get the bounds from the aoi and query carto
  //   // to find the area_type polygons that intersect this mbr
  //   // and return the collection_ids associated with those areas
  //   let bounds = turfExtent(aoi); // get the bounds with turf.js
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
  //     _this._map.fitBounds(bounds, {padding: 80});
  //     _this.props.setCollectionFilterMapAoi({aoiType: aoiType, payload: aoi});
  //   }).error(function(errors) {
  //     // errors contains a list of errors
  //     console.log("errors:" + errors);
  //   })
  // }

  getExtentIntersectedCollectionIds = (_this, aoiType, aoi) => {
    // get the bounds from the aoi and query carto
    // to find the area_type polygons that intersect this mbr
    // and return the collection_ids associated with those areas
    const bounds = aoi.bbox
    const sql = new cartodb.SQL({user: 'tnris-flood'})
    const query = `SELECT
                   areas_view.collections
                 FROM
                   area_type, areas_view
                 WHERE
                   area_type.area_type_id = areas_view.area_type_id
                 AND
                   area_type.the_geom && ST_MakeEnvelope(
                     ${bounds[2]}, ${bounds[1]}, ${bounds[0]}, ${bounds[3]})`

    sql.execute(query).done(function(data) {
      // set up the array of collection_id arrays from the returned
      // query object
      const collectionIds = data.rows.map(function (obj) {
        return obj.collections.split(",")
      })
      // combine all collection_id arrays into a single array of unique ids
      const uniqueCollectionIds = [...new Set([].concat(...collectionIds))]
      _this.setState({
        mapFilteredCollectionIds: uniqueCollectionIds
      })
      // pan and zoom to the feature
      _this._map.fitBounds(bounds, {padding: 80})
      // set the aoi details in the app state
      _this.props.setCollectionFilterMapAoi({aoiType: aoiType, payload: aoi})
    }).error(function(errors) {
      // errors contains a list of errors
      console.log("errors:" + errors)
    })
  }

  render() {
    console.log(this.props)
    return (
      <div className='collection-filter-map-component'>
        <div id='collection-filter-map'></div>
        <button
          id='map-filter-button'
          className='map-filter-button mdc-fab mdc-fab--extended mdc-fab--exited'
          onClick={this.handleFilterButtonClick}>
          {this.props.collectionFilterMapFilter.length > 0 ? 'clear map filter' : 'set map filter'}
        </button>
        <GeoSearcher
          handleGeoSearcherChange={ this.handleGeoSearcherChange }
          removeGeoSearcherLayer={ this.removeGeoSearcherLayer } />
      </div>
    );
  }
}
