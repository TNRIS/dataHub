import React from 'react'
import ReactDOM from 'react-dom'
import BasemapSelector from '../BasemapSelector'
import LayerSelector from '../LayerSelector'
import GeoSearcherContainer from '../../containers/GeoSearcherContainer'

import mapboxgl from 'mapbox-gl'
import styles from '../../sass/index.module.scss'
import turfBbox from '@turf/bbox'

const countyLabelCentroids = require('../../constants/countyCentroids.geojson.json');
const quadLabelCentroids = require('../../constants/quadCentroids.geojson.json');

export default class HistoricalAerialTemplateIndexDownload extends React.Component {
  constructor(props) {
    super(props);
    // bind our map builder functions
    this.createMap = this.createMap.bind(this);
    this.toggleLayers = this.toggleLayers.bind(this);
    this.toggleBasemaps = this.toggleBasemaps.bind(this);
    this.layerRef = {};
  }

  componentDidMount() {
    this.createMap();
  }

  componentWillUnmount() {
    if (this._map) {
      this._map.remove();
      this.layerRef = {};
    }
  }

  toggleLayers (e, map, menuItemId) {
    // if popup is open, close it
    if (document.querySelector('.mapboxgl-popup')) {
      document.querySelector('.mapboxgl-popup').remove();
    }
    // toggle between boundary and raster based on clicked menuItem
    if (menuItemId === 'index') {
      map.setLayoutProperty('index', 'visibility', 'visible');
      map.setLayoutProperty('index__outline', 'visibility', 'visible');
      map.setLayoutProperty('preview', 'visibility', 'none');
    } else {
      map.setLayoutProperty('index', 'visibility', 'none');
      map.setLayoutProperty('index__outline', 'visibility', 'none');
      map.setLayoutProperty('preview', 'visibility', 'visible');
    };
  }

  toggleBasemaps (e, map, visible) {
    map.setLayoutProperty('satellite-basemap-layer', 'visibility', visible);
    const sfx = visible === 'visible' ? 'Satellite' : '';
    const fillKey = 'boundaryFill' + sfx;
    const outlineKey = 'boundaryOutline' + sfx;
    Object.keys(this.layerRef).forEach( layer => {
      this.layerRef[layer].forEach( layerName => {
        map.setPaintProperty(layerName, 'fill-color', [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          styles['selectedFeature'],
          styles[fillKey]
        ]);
        map.setPaintProperty(layerName + '__outline', 'line-color', [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          styles['selectedFeature'],
          styles[outlineKey]
        ]);
      }, this);
    }, this);
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
      featureType === 'LineString' || featureType === 'MultiLinestring') {
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
  // if aoiType is set to 'osm'
  addGeoSearcherSource = (selectedFeature) => {
    const selectedFeatureSource = this._map.getSource('selected-feature');
    
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
  
  // adds the selected feature layer to the map if
  // aoiType is set to 'osm'
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

  // adds slected feature draw source data to the map if
  // aoiType is set to 'draw'
  addMapboxDrawSource = (selectedFeature) => {
    const selectedFeatureSource = this._map.getSource('selected-feature');
    if (typeof selectedFeatureSource === 'undefined') {
      this._map.addSource('selected-feature', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [{
            'type': 'Feature',
            'geometry': this.props.collectionFilterMapAoi.payload
          }]
        }
      });
    }
  }
  
  // adds selected feature draw layer to the map if
  // aoiType is set to 'draw'
  addMapboxDrawLayer = () => {
    if (this._map.getSource('selected-feature')) {
      const selectedFeatureLayer = this._map.getLayer('selected-feature');
          if (typeof selectedFeatureLayer === 'undefined') {
            this._map.addLayer({
              'id': 'selected-feature',
              'type': 'line',
              'source': 'selected-feature',
              'paint': {
                'line-color': styles['selectedFeatureOSM'],
                'line-width': 3,
                'line-opacity': 0.5
              }
            }, 'boundary_country_inner');
          }
    }
  }

  // clear the input and remove the 'selected-feature' layer
  // if the GeoSearcher input is cleared
  removeGeoSearcherLayer = () => {
    this.props.setGeoSearcherInputValue('');
    const selectedFeatureLayer = this._map.getLayer('selected-feature');
    if (typeof selectedFeatureLayer !== 'undefined') {
      this._map.removeLayer('selected-feature');
    }
  }

  // adds the GeoSearcher's 'selected-feature' layer to the map
  // and moves the map to show the feature
  handleGeoSearcherChange = (selectedFeature) => {
    if (selectedFeature !== null) {
      this.addGeoSearcherSource(selectedFeature);
      this.addGeoSearcherLayer(selectedFeature);

      this._map.fitBounds(
        selectedFeature.bbox,
        {padding: 80}
      );
    }
  }
  //
  // END GEOSEARCHER METHODS
  //

  createMap() {
    this.layerRef = {};
    
    // define mapbox map
    mapboxgl.accessToken = 'undefined';
    const map = new mapboxgl.Map({
      container: 'historical-index-download-map', // container id
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [-99.341389, 31.330000],
      zoom: 4,
      minZoom: 5
    });
    this._map = map;
    map.addControl(new mapboxgl.NavigationControl({
        showCompass: false
    }), 'top-left');
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
    //
    // START LAYER CONTROL
    //
    // class for custom map controls used below
    // *** event handler is commented out but might
    // be useful for future new controls ***
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
      id: 'download-menu',
      className: 'tnris-download-menu',
      title: 'Download Area Selector'
    });

    // add custom control to map
    if (!document.querySelector('.tnris-download-menu')) {
      map.addControl(ctrlMenu, 'top-right')
    }
    // add custom controls to map
    const ctrlMenuNode = document.querySelector('#download-menu');
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
    
    const layerSelectorContainer = document.createElement('div');
    layerSelectorContainer.id = 'layer-selector-container';
    ctrlMenuNode.appendChild(layerSelectorContainer);
    // add layer selector component to container
    const areaTypesAry = ['index', 'preview'];
    const startLayer = 'index';
    ReactDOM.render(<LayerSelector map={map} handler={this.toggleLayers} areaTypes={areaTypesAry} startLayer={startLayer} />, layerSelectorContainer);
    //
    // END LAYER CONTROL
    //

    // Check if an aoi has been set in the geo filter
    // and overide the below fitBounds call if it has.
    // The map will fit to the bounds of the aoi instead.
    if (Object.keys(this.props.collectionFilterMapAoi).length < 1) {
      // get the service bounding box and zoom map to features' extent
      const wmsCapabilities = this.props.indexUrl + '&SERVICE=WMS&VERSION=1.0.0&REQUEST=GetCapabilities';
      fetch(wmsCapabilities)
      .then(res => res.text())
      .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
      .then(data => {
        const bbox = data.getElementsByTagName("LatLonBoundingBox")[0];
        map.fitBounds([[bbox.getAttribute('minx'), bbox.getAttribute('miny')], [bbox.getAttribute('maxx'), bbox.getAttribute('maxy')]],{padding: 20});
      })
      .catch(error => {
        console.log('Error retrieving LatLongBoundingBox of WMS Service', error);
        console.log('URL', wmsCapabilities)
      });
    }

    //
    // add wms & vector tile service layers
    //
    const rasterLayer = this.props.serviceLayer + '_index';
    const boundaryLayer = this.props.serviceLayer + '_index_index';
    const mvtUrl = this.props.indexUrl + '&mode=tile&tilemode=gmap&tile={x}+{y}+{z}&layers=all&map.imagetype=mvt';
    const wmsRasterUrl = this.props.indexUrl + '&bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=' + rasterLayer;
    this.layerRef[boundaryLayer] = ['index'];
    map.on('load', function() {
      //
      // START COUNTY AND QUAD REFERENCE LAYERS
      //
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
      //
      // END COUNTY AND QUAD REFERENCE LAYERS
      //

      // use the tiles url query on index service
      // to add a source to the map
      map.addSource(
        'index-boundary-mvt',
        { type: 'vector', tiles: [mvtUrl] }
      );

      // add the index sheets outline layer
      map.addLayer({
          id: 'index__outline',
          'type': 'line',
          'source': 'index-boundary-mvt',
          'source-layer': boundaryLayer,
          'layout': {'visibility': 'visible'},
          'interactive': true,
          'paint': {
            // hover state is set here using a case expression
            // if hover is false, then color should be grey
            // if hover is true then color should be blue
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              styles['selectedFeature'],
              styles['boundaryOutline']
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              2.5,
              1.5
            ],
            'line-opacity': 1
          }
      });

      // add the index sheets polygon layer
      map.addLayer({
        id: 'index',
        'type': 'fill',
        'source': 'index-boundary-mvt',
        'source-layer': boundaryLayer,
        'layout': {'visibility': 'visible'},
        'interactive': true,
        'paint': {
          // hover state is set here using a case expression
          // if hover is false, then color should be grey
          // if hover is true then color should be blue
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            styles['selectedFeature'],
            styles['boundaryFill']
          ],
          'fill-opacity': .1,
          'fill-outline-color': styles['boundaryFill']
        }
      }, 'index__outline');

      // use the wms url query on index service
      // to add a source to the map
      map.addSource(
        'index-raster-wms',
        { type: 'raster', tiles: [wmsRasterUrl], tileSize: 256 }
      );

      // add the index sheets raster layer
      map.addLayer({
        id: 'preview',
        type: 'raster',
        source: 'index-raster-wms',
        'layout': {'visibility': 'none'}
      });
    });

    // wire the popup
    const popupTitle = this.props.popupTitle;
    map.on('click', 'index', function (e) {
      // since sheets can possibly overlap, order by sheet number
      function compare(a,b) {
        if (parseInt(a.properties.frame_num) < parseInt(b.properties.frame_num))
            return -1;
        if (parseInt(a.properties.frame_num) > parseInt(b.properties.frame_num))
            return 1;
        return 0;
      }
      const ordered = e.features.sort(compare);
      // iterate all features to populate
      // details of all features clicked into popup
      let popupContent = "";
      ordered.forEach(f => {
        const countyPathSlot = f.properties.dl_orig.split("/")[5];
        const county = countyPathSlot !== 'MultiCounty' ? ' - ' + countyPathSlot : '';
        const sheet = `
          <li>
            <strong>#${f.properties.frame_num}${county}</strong>
            <ul>
              <li><a href="${f.properties.dl_orig}" target="_blank">Original</a></li>
              <li><a href="${f.properties.dl_georef}" target="_blank">Georeferenced</a></li>
            </ul>
          </li>
        `;
        popupContent += sheet;
      });
      // create popup with constructed content string
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${popupTitle}</strong><br/><a href="${e.features[0].properties.dl_index}" target="_blank">Bounding Box Shapefile</a><ul>${popupContent}</ul>`)
        .addTo(map);
    });

    // toggle the layer symbology when the cursor enters a feature
    let hoveredStateId = null;
    map.on('mousemove', 'index', (e) => {
      // Change the cursor to a pointer when it enters a boundary feature
      map.getCanvas().style.cursor = 'pointer';
      if (e.features.length > 0) {
        if (hoveredStateId !== undefined) {
          // set the hover attribute to false with feature state
          map.setFeatureState({
            source: 'index-boundary-mvt',
            sourceLayer: boundaryLayer,
            id: hoveredStateId
          }, {
            hover: false
          });
        }
        hoveredStateId = e.features[0].id;
        // set the hover attribute to true with feature state
        map.setFeatureState({
          source: 'index-boundary-mvt',
          sourceLayer: boundaryLayer,
          id: hoveredStateId
        }, {
          hover: true
        });
      }
    });

    // toggle the layer symbology when the cursor leaves a feature
    map.on('mouseleave', 'index', function () {
      // Undo the cursor pointer when it leaves a boundary feature
      map.getCanvas().style.cursor = '';
      if (hoveredStateId !== undefined) {
        // set the hover attribute to false with feature state
        map.setFeatureState({
          source: 'index-boundary-mvt',
          sourceLayer: boundaryLayer,
          id: hoveredStateId
        }, {
          hover: false
        });
      }
      hoveredStateId = null;
    });

    // if a geo filter aoi is set in the app's state on map load,
    // add it to the map and fit the map's bounds to the extent
    this._map.on('load', () => {
      if (Object.keys(this.props.collectionFilterMapAoi).length > 0) {
        if (this.props.collectionFilterMapAoi.aoiType === 'draw') {
          // add the draw aoi source and layer to the map
          this.addMapboxDrawSource(this.props.collectionFilterMapAoi.payload);
          this.addMapboxDrawLayer();
        } else if (this.props.collectionFilterMapAoi.aoiType === 'osm') {
            // add the GeoSearcher aoi source and layer to the map
            this.addGeoSearcherSource(this.props.collectionFilterMapAoi.payload);
            this.addGeoSearcherLayer(this.props.collectionFilterMapAoi.payload);
        }
        this._map.fitBounds(turfBbox(
          this.props.collectionFilterMapAoi.payload
        ), {padding: 80});
      }
    })
  }

  render() {
    const geoSearcher = (
      <GeoSearcherContainer
        handleGeoSearcherChange={ this.handleGeoSearcherChange }
        resetTheMap={ this.removeGeoSearcherLayer } />
    );

    return (
      <div className="template-content-div historical-aerial-template-index-download">
        <div className='template-content-div-header mdc-typography--headline5'>
          Download
        </div>
        <div className='template-content-div-subheader mdc-typography--headline7'>
        Click a polygon in the map to download available index.
        </div>
        <div id='historical-index-download-map'></div>
        {Object.keys(this.props.collectionFilterMapAoi).length > 0 ?
         '' : geoSearcher}
      </div>
    )
  }
}
