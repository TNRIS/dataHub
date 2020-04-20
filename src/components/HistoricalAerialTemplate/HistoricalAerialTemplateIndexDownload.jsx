import React from 'react'
import ReactDOM from 'react-dom'
import BasemapSelector from '../BasemapSelector'

import mapboxgl from 'mapbox-gl'
import styles from '../../sass/index.scss'

// the carto core api is a CDN in the app template HTML (not available as NPM package)
// so we create a constant to represent it so it's available to the component
const cartodb = window.cartodb;
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
    if (this.map) {
      this.map.remove();
    }
  }

  toggleLayers (e, map, menuItemId) {
    // if popup is open, close it
    if (document.querySelector('.mapboxgl-popup')) {
      document.querySelector('.mapboxgl-popup').remove();
    }
    // toggle between boundary and raster based on clicked menuItem
    if (menuItemId === 'boundary-layer') {
      map.setLayoutProperty('boundary-layer', 'visibility', 'visible');
      map.setLayoutProperty('boundary-layer__outline', 'visibility', 'visible');
      map.setLayoutProperty('raster-layer', 'visibility', 'none');
      document.querySelector('#boundary-layer').className = 'mdc-list-item mdc-list-item--activated';
      document.querySelector('#raster-layer').className = 'mdc-list-item';
    } else {
      map.setLayoutProperty('boundary-layer', 'visibility', 'none');
      map.setLayoutProperty('boundary-layer__outline', 'visibility', 'none');
      map.setLayoutProperty('raster-layer', 'visibility', 'visible');
      document.querySelector('#boundary-layer').className = 'mdc-list-item';
      document.querySelector('#raster-layer').className = 'mdc-list-item mdc-list-item--activated';
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
        map.setPaintProperty(layerName + '__outline', 'line-color', styles[outlineKey]);
      }, this);
    }, this);
  }

  createMap() {
    // define mapbox map
    mapboxgl.accessToken = 'undefined';
    const map = new mapboxgl.Map({
      container: 'historical-index-download-map', // container id
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [-99.341389, 31.330000],
      zoom: 4,
      minZoom: 5
    });
    this.map = map;
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

    // add mvt layer to menu items. use layer 'id' for link 'id'
    var mvtMenuLink = document.createElement('a');
    mvtMenuLink.href = '#';
    mvtMenuLink.id = 'boundary-layer';
    mvtMenuLink.textContent = 'DOWNLOAD';
    mvtMenuLink.className = 'mdc-list-item mdc-list-item--activated';
    mvtMenuLink.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleLayers(e, map, 'boundary-layer');
    };
    layerSelectorContainer.appendChild(mvtMenuLink);
    // add wms layer to menu items
    var wmsMenuLink = document.createElement('a');
    wmsMenuLink.href = '#';
    wmsMenuLink.id = 'raster-layer';
    wmsMenuLink.textContent = 'PREVIEW';
    wmsMenuLink.className = 'mdc-list-item';
    wmsMenuLink.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleLayers(e, map, 'raster-layer');
    };
    layerSelectorContainer.appendChild(wmsMenuLink);
    //
    // END LAYER CONTROL
    //

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

    //
    // add wms & vector tile service layers
    //
    const rasterLayer = this.props.serviceLayer + '_index';
    const boundaryLayer = this.props.serviceLayer + '_index_index';
    const mvtUrl = this.props.indexUrl + '&mode=tile&tilemode=gmap&tile={x}+{y}+{z}&layers=all&map.imagetype=mvt';
    const wmsRasterUrl = this.props.indexUrl + '&bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=' + rasterLayer;
    this.layerRef[boundaryLayer] = ['boundary-layer'];
    map.on('load', function() {
      //
      // START COUNTY AND QUAD REFERENCE LAYERS
      //
      // define area type layers and add to the map
      const areaTypeLayerData = {
        user_name: 'tnris-flood',
        sublayers: [{
          sql: `SELECT
                  the_geom_webmercator,
                  area_type
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
          'source-layer': 'layer0',
          'minzoom': 9,
          'maxzoom': 24,
          'paint': {
            'line-color': 'rgba(139,69,19,1)',
            'line-width': 2,
            'line-opacity': .05
          },
          'filter': ["==", ["get", "area_type"], "quad"]
        }, 'county-outline');
      });

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
          id: 'boundary-layer__outline',
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
        id: 'boundary-layer',
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
            '#1E8DC1',
            styles['boundaryFill']
          ],
          'fill-opacity': .1,
          'fill-outline-color': styles['boundaryFill']
        }
      }, 'boundary-layer__outline');

      // use the wms url query on index service
      // to add a source to the map
      map.addSource(
        'index-raster-wms',
        { type: 'raster', tiles: [wmsRasterUrl], tileSize: 256 }
      );

      // add the index sheets raster layer
      map.addLayer({
        id: 'raster-layer',
        type: 'raster',
        source: 'index-raster-wms',
        'layout': {'visibility': 'none'}
      });
    });

    // wire the popup
    const popupTitle = this.props.popupTitle;
    map.on('click', 'boundary-layer', function (e) {
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
    map.on('mousemove', 'boundary-layer', (e) => {
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
    map.on('mouseleave', 'boundary-layer', function () {
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
  }

  render() {
    return (
      <div className="template-content-div historical-aerial-template-index-download">
        <div className='template-content-div-header mdc-typography--headline5'>
          Download
        </div>
        <div className='template-content-div-subheader mdc-typography--headline7'>
        Click a polygon in the map to download available index.
        </div>
        <div id='historical-index-download-map'></div>
      </div>
    )
  }
}
