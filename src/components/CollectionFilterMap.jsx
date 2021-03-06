import React from 'react'
import ReactDOM from 'react-dom'
import BasemapSelector from './BasemapSelector'
import CollectionFilterMapInstructions from './CollectionFilterMapInstructions'
import GeoSearcherContainer from '../containers/GeoSearcherContainer'

import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode'
import turfBbox from '@turf/bbox'
import styles from '../sass/index.module.scss'

// global sass breakpoint variables to be used in js
import breakpoints from '../sass/_breakpoints.module.scss'

const countyLabelCentroids = require('../constants/countyCentroids.geojson.json');
const quadLabelCentroids = require('../constants/quadCentroids.geojson.json');

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
    this.downloadBreakpoint = parseInt(breakpoints.download, 10);
    this.toggleBasemaps = this.toggleBasemaps.bind(this);
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
    // Disable user interaction if a filter has been set
    if (this.props.collectionFilterMapFilter.length > 0) {
      this.disableUserInteraction();
    }
  }

  componentWillUnmount() {
    // On close, clear the GeoSearcher input
    // value and the filter map aoi
    this.props.setGeoSearcherInputValue('')
    this.props.setCollectionFilterMapAoi({});
    // reset the map zoom and center for the next reload
    this.props.setCollectionFilterMapCenter({lng: -99.341389, lat: 31.33}); // the center of Texas
    this.props.setCollectionFilterMapZoom(5.8);
  }

  toggleBasemaps (e, map, visible) {
    map.setLayoutProperty('satellite-basemap-layer', 'visibility', visible);
  }

  //
  // START GEOSEARCHER METHODS
  //
  // returns layer properties based on feature type for the
  // geosearcher 'selected-feature' layer
  getGeoSearcherLayerProps = (featureType) => {
    if (featureType === 'Point' || featureType === 'MultiPoint') {
      return {
        'type': 'circle',
        'paint': {
          'circle-radius': 9,
          'circle-color': styles['selectedFeatureOSM'],
          'circle-opacity': 0.5
        }
      };
    } else if (
      featureType === 'Polygon' || featureType === 'MultiPolygon') {
        return {
          'type': 'fill',
          'paint': {
            'fill-color': styles['selectedFeatureOSM'],
            'fill-opacity': 0.2,
            'fill-outline-color': styles['selectedFeatureOSM']
          }             
        };
    } else if (
      featureType === 'LineString' || featureType === 'MultiLineString') {
        return {
          'type': 'line',
          'paint': {
            'line-color': styles['selectedFeatureOSM'],
            'line-width': 5,
            'line-opacity': 0.5
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
    // selected feature layer definition
    const layerObject = {
      'id': 'selected-feature',
      'type': this.getGeoSearcherLayerProps(
        selectedFeature.geometry.type).type,
      'source': 'selected-feature',
      'paint': this.getGeoSearcherLayerProps(
        selectedFeature.geometry.type).paint
    };
  
    // check for the selected feature source
    // before adding the layer
    if (this._map.getSource('selected-feature')) {
        // check if the selected feature layer is in the map
        // and add it if not. if it is remove the layer
        // and add a new one.
        const selectedFeatureLayer = this._map.getLayer('selected-feature');
        if (typeof selectedFeatureLayer === 'undefined') {
          this._map.addLayer(layerObject, 'boundary_country_inner');
        } else {
          this._map.removeLayer('selected-feature');
          this._map.addLayer(layerObject, 'boundary_country_inner');
        }
    };
  }
  
  // removes the 'selected-feature' layer from the map
  removeGeoSearcherLayer = () => {
    const selectedFeatureLayer = this._map.getLayer('selected-feature');
    if (typeof selectedFeatureLayer !== 'undefined') {
      this._map.removeLayer('selected-feature');
    }
  }
  
  // adds the GeoSearcher's 'selected-feature' layer to the map,
  // moves the map to show the feature, and sets the aoi in the app state
  handleGeoSearcherChange = (selectedFeature) => {
    if (selectedFeature !== null) {
      if (this.props.collectionFilterMapFilter.length > 0) {
        this.props.setCollectionFilterMapFilter([])
      }
      // check if there is a user defined polygon in the map
      // and remove it before continuing
      const features = this._draw.getAll();
      if (features.features.length > 0) {
        this._draw.deleteAll();
      }
      this.addGeoSearcherSource(selectedFeature);
      this.addGeoSearcherLayer(selectedFeature);
      this.getExtentIntersectedCollectionIds(this, 'osm', selectedFeature);
      document.getElementById(
        'map-filter-button'
      ).classList.remove('mdc-fab--exited');
    }
  }
  //
  // END GEOSEARCHER METHODS
  //

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
        el.className = 'mapboxgl-ctrl-icon material-icons zoom-to-extent';
        el.type = 'button';
        el.title = 'Reset extent to statewide';
        el.setAttribute('aria-label', 'Reset extent to statewide');
        el.textContent = 'home';
        el.addEventListener('click',
          (e) => {
            this._map.easeTo({
              center: [-99.341389, 31.33],
              zoom: 5.8,
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
      const areaTypeTiles = 'https://mapserver.tnris.org/?map=/tnris_mapfiles/area_type.map&mode=tile&tilemode=gmap&tile={x}+{y}+{z}&layers=reference_boundaries&map.imagetype=mvt';

      map.addSource(
        'area-type-source',
        { type: 'vector', tiles: [areaTypeTiles] }
      );

      // Add the county outlines to the map
      map.addLayer({
        'id': 'county-outline',
        'type': 'line',
        'source': 'area-type-source',
        'source-layer': 'reference_boundaries',
        'layout': {'visibility': 'visible'},
        'minzoom': 2,
        'maxzoom': 24,
        'paint': {
          'line-color': styles['boundaryOutline'],
          'line-width': 2,
          'line-opacity': .2
        },
        'filter': ["==", ["get", "area_type"], "county"]
      });

      // Add the quad outlines to the map
      map.addLayer({
        'id': 'quad-outline',
        'type': 'line',
        'source': 'area-type-source',
        'source-layer': 'reference_boundaries',
        'layout': {'visibility': 'visible'},
        'minzoom': 9,
        'maxzoom': 24,
        'paint': {
          'line-color': 'rgba(139,69,19,1)',
          'line-width': 2,
          'line-opacity': .05
        },
        'filter': ["==", ["get", "area_type"], "quad"]
      }, 'county-outline');

      // add the point sources for the county and quad
      // reference layer labels
      map.addSource("county-centroid", {
        "type": "geojson",
        "data": countyLabelCentroids
      });

      map.addSource("quad-centroid", {
        "type": "geojson",
        "data": quadLabelCentroids
      });

      // add symbol layer to label the counties
      map.addLayer({
        "id": "county-label",
        "type": "symbol",
        "source": "county-centroid",
        'minzoom': 6,
        'maxzoom': 24,
        "layout": {
          "text-field": ["get", "area_type_name"],
          "text-justify": "auto",
          'text-size': {
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

      // add symbol layer to label the quads
      map.addLayer({
        "id": "quad-label",
        "type": "symbol",
        "source": "quad-centroid",
        'minzoom': 9,
        'maxzoom': 24,
        "layout": {
          "text-field": ["get", "area_type_name"],
          'text-size': {
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
      }, 'county-label');
    });
    //
    // END COUNTY AND QUAD REFERENCE LAYER
    //

    //
    // START BASEMAP SELECTOR & INSTRUCTIONS BUTTONS
    //
    // class for custom map controls used below
    // *** event handler is commented out but might be
    // useful for future new controls ***
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
            'fill-color': styles['selectedFeatureOSM'],
            'fill-outline-color': styles['selectedFeatureOSM'],
            'fill-opacity': 0,
          }
        },
        {
          'id': 'gl-draw-polygon-fill-active',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'true'],
            ['==', '$type', 'Polygon']
          ],
          'paint': {
            'fill-color': styles['selectedFeatureOSM'],
            'fill-outline-color': styles['selectedFeatureOSM'],
            'fill-opacity': 0.2,
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
            'line-color': styles['selectedFeatureOSM'],
            'line-width': 3,
            'line-opacity': 0.5,
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
            'line-color': styles['selectedFeatureOSM'],
            'line-dasharray': [0.2, 2],
            'line-width': 3,
            'line-opacity': 0.5,
          }
        }
      ]
    });
    this._map.addControl(this._draw, 'top-left');

    // Check if the draw mode is draw_polygon, if so, change it to draw_rectangle.
    // If there are previously drawn features on the map, delete them.
    // We do this so there is only one aoi polygon in the map at a time.
    this._map.on('draw.modechange', (e) => {
      // remove any GeoSearcher features in the map
      if (this.props.collectionFilterMapAoi.aoiType === 'osm') {
        this.resetTheMap();
      }
      if (e.mode === 'draw_polygon') {
        this._draw.changeMode('draw_rectangle');
        const features = this._draw.getAll();
        if (features.features.length > 1) {
          this._draw.delete(features.features[0].id);
          this.props.setCollectionFilterMapAoi({});
          this.props.setCollectionFilterMapFilter([]);
          document.getElementById(
            'map-filter-button'
          ).classList.add('mdc-fab--exited');
        }
      }
    })

    this._map.on('draw.create', (e) => {
      // get the draw feature's geojson object
      const aoi = e.features[0];
      // add the feature's bounding box to the geojson object
      aoi.bbox = turfBbox(aoi.geometry);

      this.getExtentIntersectedCollectionIds(this, 'draw', e.features[0]);
      document.getElementById(
        'map-filter-button'
      ).classList.remove('mdc-fab--exited');
    })

    this._map.on('draw.update', (e) => {
      // get the draw feature's geojson object
      const aoi = e.features[0];
      // add the feature's bounding box to the geojson object
      aoi.bbox = turfBbox(aoi.geometry);

      this.props.setCollectionFilterMapFilter([]);
      this.getExtentIntersectedCollectionIds(this, 'draw', e.features[0]);
    })

    this._map.on('draw.delete', (e) => {
      this.resetTheMap();
    })

    this._map.on('moveend', () => {
      this.props.setCollectionFilterMapCenter(this._map.getCenter());
      this.props.setCollectionFilterMapZoom(this._map.getZoom());
    })

    // if an aoi is set in the app's state on map load,
    // add it to the map and fit the map's bounds to the extent
    this._map.on('load', () => {
      if (Object.keys(this.props.collectionFilterMapAoi).length > 0) {
        if (this.props.collectionFilterMapAoi.aoiType === 'draw') {
          this._draw.add(this.props.collectionFilterMapAoi.payload);
        } else if (this.props.collectionFilterMapAoi.aoiType === 'osm') {
            this.addGeoSearcherSource(this.props.collectionFilterMapAoi.payload);
            this.addGeoSearcherLayer(this.props.collectionFilterMapAoi.payload);
        }
        this._map.fitBounds(turfBbox(
          this.props.collectionFilterMapAoi.payload
        ), {padding: 80});
        document.getElementById(
          'map-filter-button'
        ).classList.remove('mdc-fab--exited');
      }
    })
  }

  // disable the map controls when a filter is set
  disableUserInteraction = () => {
    // select the controls to disable
    const mapElement = document.querySelector('.mapboxgl-canvas');
    const zoomInControl = document.querySelector('.mapboxgl-ctrl-zoom-in');
    const zoomOutControl = document.querySelector('.mapboxgl-ctrl-zoom-out');
    const zoomToExtentControl = document.querySelector('.zoom-to-extent');
    const drawControls = document.querySelectorAll(
      '.mapbox-gl-draw_ctrl-draw-btn'
    );
    const basemapMenu = document.querySelector('.tnris-basemap-menu');
    const mdcSwitch = document.querySelector('.mdc-switch');
    
    // disable the controls
    mapElement.classList.add('disabled-map');
    zoomInControl.disabled = true;
    zoomInControl.classList.add('disabled-button');
    zoomOutControl.disabled = true;
    zoomOutControl.classList.add('disabled-button');
    zoomToExtentControl.disabled = true;
    zoomToExtentControl.classList.add('disabled-button');
    drawControls.forEach((drawControl) => {
      drawControl.disabled = true;
      drawControl.classList.add('disabled-button');
    })
    basemapMenu.classList.add('disabled-button');
    mdcSwitch.classList.add('mdc-switch--disabled');
  }

  // re-enable the map controls when a filter is cleared
  enableUserInteraction = () => {
    // select the controls to enable
    const mapElement = document.querySelector('.mapboxgl-canvas');
    const zoomInControl = document.querySelector('.mapboxgl-ctrl-zoom-in');
    const zoomOutControl = document.querySelector('.mapboxgl-ctrl-zoom-out');
    const zoomToExtentControl = document.querySelector('.zoom-to-extent');
    const drawControls = document.querySelectorAll(
      '.mapbox-gl-draw_ctrl-draw-btn'
    );
    const basemapMenu = document.querySelector('.tnris-basemap-menu');
    const mdcSwitch = document.querySelector('.mdc-switch');

    // enable the controls
    mapElement.classList.remove('disabled-map');
    zoomInControl.disabled = false;
    zoomInControl.classList.remove('disabled-button');
    zoomOutControl.disabled = false;
    zoomOutControl.classList.remove('disabled-button');
    zoomToExtentControl.disabled = false;
    zoomToExtentControl.classList.remove('disabled-button');
    drawControls.forEach((drawControl) => {
      drawControl.disabled = false;
      drawControl.classList.remove('disabled-button');
    })
    basemapMenu.classList.remove('disabled-button');
    mdcSwitch.classList.remove('mdc-switch--disabled');
  }
  
  resetTheMap() {
    // resets the map filter and aoi objects to empty, enables user
    // interaction controls, and hides the map filter button till
    // it is needed again
    this.props.setCollectionFilterMapAoi({});
    this.props.setCollectionFilterMapFilter([]);
    this.props.setGeoSearcherInputValue('');
    this._draw.deleteAll();
    this.removeGeoSearcherLayer();
    this.enableUserInteraction();
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
        geo: this.props.collectionFilterMapAoi.payload.geometry
      };
    } else {
      filterObj = {
        ...prevFilter,
        geo: {
          'osm': this.props.collectionFilterMapAoi.payload.properties.display_name
        }
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

  getExtentIntersectedCollectionIds = (_this, aoiType, aoi) => {
    // get the bounds from the aoi and query mapserver
    // to find the area_type polygons that intersect this mbr
    // and return the collection_ids associated with those areas
    const bounds = aoi.bbox;
    const geoJsonFeatures = `https://mapserver.tnris.org/?map=/tnris_mapfiles/download_areas.map&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=envelope_query&outputformat=geojson&SRSNAME=EPSG:4326&xmin=${bounds[2]}&ymin=${bounds[1]}&xmax=${bounds[0]}&ymax=${bounds[3]}`;
    fetch(geoJsonFeatures)
    .then(res => res.json())
    .then(json => {
      // set up the array of collection_id arrays from the returned
      // query object
      const collectionIds = json.features.map(function (obj) {
        return obj.properties.collections.split(",");
      });
      // combine all collection_id arrays into a single array of unique ids
      const uniqueCollectionIds = [...new Set([].concat(...collectionIds))];
      _this.setState({
        mapFilteredCollectionIds: uniqueCollectionIds
      });
      // pan and zoom to the feature
      _this._map.fitBounds(bounds, {padding: 80});
      // set the aoi details in the app state
      _this.props.setCollectionFilterMapAoi({aoiType: aoiType, payload: aoi});
    })
    .catch(error => console.log(error));
  }

  render() {
    return (
      <div className='collection-filter-map-component'>
        <div id='collection-filter-map'></div>
        <button
          id='map-filter-button'
          className='map-filter-button mdc-fab mdc-fab--extended
            mdc-fab--exited'
          onClick={this.handleFilterButtonClick}
          title={
            this.props.collectionFilterMapFilter.length > 0 ?
              'Clear map filter and re-enable map interaction' :
              'Set map filter'
          }>
          {this.props.collectionFilterMapFilter.length > 0 ?
            'clear map filter' : 'set map filter'}
        </button>
        <GeoSearcherContainer
          handleGeoSearcherChange={ this.handleGeoSearcherChange }
          resetTheMap={ this.resetTheMap } />
      </div>
    );
  }
}
