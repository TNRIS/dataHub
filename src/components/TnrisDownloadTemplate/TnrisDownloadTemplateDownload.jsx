import React from 'react'
import { GridLoader } from 'react-spinners'
import ReactDOM from 'react-dom'
import BasemapSelector from '../BasemapSelector'
import LayerSelector from '../LayerSelector'

import mapboxgl from 'mapbox-gl'
import styles from '../../sass/index.scss'

// global sass breakpoint variables to be used in js
import breakpoints from '../../sass/_breakpoints.scss'

// the carto core api is a CDN in the app template HTML (not available as NPM package)
// so we create a constant to represent it so it's available to the component
const cartodb = window.cartodb;
const countyLabelCentroids = require('../../constants/countyCentroids.geojson.json');
const quadLabelCentroids = require('../../constants/quadCentroids.geojson.json');

export default class TnrisDownloadTemplateDownload extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        resourceLength: null,
        areaTypesLength: 1
      };
      // bind our map builder functions
      this.createMap = this.createMap.bind(this);
      this.createPreviewLayer = this.createPreviewLayer.bind(this);
      this.createLayers = this.createLayers.bind(this);
      this.toggleLayers = this.toggleLayers.bind(this);
      this.toggleBasemaps = this.toggleBasemaps.bind(this);
      this.layerRef = {};
      this.stateMinZoom = 5;
      this.qquadMinZoom = 8;
      this.downloadBreakpoint = parseInt(breakpoints.download, 10);
  }

  componentDidMount() {
    // on mount/load, try and launch the map. if the api response with the list
    // of downloadable resources hasn't returned we won't launch it
    if (this.props.loadingResources === false && this.props.resourceAreaTypes) {
      this.areaLookup = this.props.resourceAreas;
      if (window.innerWidth > this.downloadBreakpoint) {
        this.createMap();
      }
    }
  }

  componentDidUpdate () {
    // when the api response with the list of downloadable resources finally
    // returns, the component will update so we launch the map at that time
    if (this.props.loadingResources === false && this.props.selectedCollectionResources.result.length > 0) {
      this.areaLookup = this.props.resourceAreas;
      if (window.innerWidth > this.downloadBreakpoint) {
        this.createMap();
      }
    }

    if (this.props.selectedCollectionResources.result && this.props.selectedCollectionResources.result.length === 0) {
      this.setState({resourceLength:this.props.selectedCollectionResources.result.length});
    }
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.remove();
    }
  }

  toggleLayers (e, map, areaType) {
    // if popup is open, close it
    if (document.querySelector('.mapboxgl-popup')) {
      document.querySelector('.mapboxgl-popup').remove();
    }
    // naip and top qquad layers get qqMinZoom, everything else is state zoom
    if (this.props.collection.name.includes('NAIP') && areaType === 'qquad') {
      map.setMinZoom(this.qquadMinZoom);
    }
    else if (this.props.collection.name.includes('TOP') && areaType === 'qquad') {
      map.setMinZoom(this.qquadMinZoom);
    }
    else {
      map.setMinZoom(this.stateMinZoom);
    }
    // iterate layerRef for layers in map by areaType key
    Object.keys(this.layerRef).forEach( layer => {
      // if iteration is looking at the clicked layer in the menu, turn that
      // layer's layer id's on. otherwise, turn the that layer's layer id's off
      if (layer === areaType) {
        // iterate layer id's for clicked areaType and toggle their visibility
        this.layerRef[layer].forEach( layerName => {
          map.setLayoutProperty(layerName, 'visibility', 'visible');
          map.setLayoutProperty(layerName + '__outline', 'visibility', 'visible');
        }, this);
        // special map handling for preview layer since it has a single layerName
        // which is different from the other layers and not present in this.layerRef
        if (layer === 'preview') {
          map.setLayoutProperty('wms-preview-layer', 'visibility', 'visible');
        }
      }
      else {
        // iterate layer id's for clicked areaType and toggle their visibility
        this.layerRef[layer].forEach( layerName => {
          map.setLayoutProperty(layerName, 'visibility', 'none');
          map.setLayoutProperty(layerName + '__outline', 'visibility', 'none');
        }, this);
        // special map handling for preview layer since it has a single layerName
        // which is different from the other layers and not present in this.layerRef
        if (layer === 'preview') {
          map.setLayoutProperty('wms-preview-layer', 'visibility', 'none');
        }
      }
    }, this);
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
        container: 'tnris-download-map', // container id
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [-99.341389, 31.330000],
        zoom: 6
    });
    this.map = map;
    map.addControl(new mapboxgl.NavigationControl({
      showCompass: false
    }), 'top-left');
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
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
            'line-width': 1.5,
            'line-opacity': .2
          },
          'filter': ['==', ['get', 'area_type'], 'county']
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
            'line-width': 1.5,
            'line-opacity': .05
          },
          'filter': ['==', ['get', 'area_type'], 'quad']
        }, 'county-outline');
      });

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
      }, "county-label");
    });
    //
    // END COUNTY AND QUAD REFERENCE LAYER
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
      id: 'download-menu',
      className: 'tnris-download-menu',
      title: 'Download Area Selector'
    });

    const areaTypesAry = Object.keys(this.props.resourceAreaTypes).sort();
    // set the active areaType to be the one with the largest area polygons
    // for faster initial load
    let startLayer = 'qquad';
    if (areaTypesAry.includes('state')) {
      startLayer = 'state';
    } else if (areaTypesAry.includes('250k')) {
      startLayer = '250k';
    } else if (areaTypesAry.includes('block')) {
      startLayer = 'block';
    } else if (areaTypesAry.includes('county')) {
      startLayer = 'county';
    } else if (areaTypesAry.includes('quad')) {
      startLayer = 'quad';
    }
    // add wms preview option to array if wms_link present
    if (this.props.collection.wms_link && this.props.collection.wms_link !== "") {
      areaTypesAry.push('preview');
    }

    // areaTypes length in state turns on display of layer menu if more than 1 layer
    if (areaTypesAry.length !== this.state.areaTypesLength) {
      this.setState({
        areaTypesLength: areaTypesAry.length
      });
    }

    // set initial minZoom
    // naip and top qquad layers get qqMinZoom, everything else is state zoom
    if (this.props.collection.name.includes('NAIP') && startLayer === 'qquad') {
      map.setMinZoom(this.qquadMinZoom);
    }
    else if (this.props.collection.name.includes('TOP') && startLayer === 'qquad') {
      map.setMinZoom(this.qquadMinZoom);
    }
    else {
      map.setMinZoom(this.stateMinZoom);
    }

    // add custom control to map
    if (!document.querySelector('.tnris-download-menu')) {
      map.addControl(ctrlMenu, 'top-right');
    }
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
    // only add download layer selectors container if areaTypesAry.length
    // is greater than one (multiple layers exist)
    if (areaTypesAry.length > 1) {
      const layerSelectorContainer = document.createElement('div');
      layerSelectorContainer.id = 'layer-selector-container';
      ctrlMenuNode.appendChild(layerSelectorContainer);
      // add basemap selector component to container
      ReactDOM.render(<LayerSelector map={map} handler={this.toggleLayers} areaTypes={areaTypesAry} startLayer={startLayer} />, layerSelectorContainer);
    }

    // iterate our area_types so we can add them to different layers for
    // layer control in the map and prevent overlap of area polygons
    areaTypesAry.map(areaType => {
      // set aside array in layerRef object for populating with layer ids for
      // layers of this areaType
      this.layerRef[areaType] = [];
      // set aside the api response with all available resources (downloads)
      // for this areaType
      const areasList = [...new Set(this.props.resourceAreaTypes[areaType])];

      let visibility;
      switch (areaType === startLayer) {
        case true:
          visibility = 'visible';
          // since this is our initial layer on display, we'll zoom to the bounds
          const areasString = areasList.join("','");
          const boundsQuery = "SELECT * FROM area_type WHERE area_type_id IN ('" + areasString + "')";
          const sql = new cartodb.SQL({ user: 'tnris-flood' });
          sql.getBounds(boundsQuery).done(function(bounds) {
            // set map to extent of download areas
            map.fitBounds(
              [[bounds[1][1],bounds[1][0]],[bounds[0][1],bounds[0][0]]],
              {padding: 20}
            );
          });
          break;
        default:
          visibility = 'none';
      }

      // get total number of resources available for download
      const total = areasList.length;
      // if the preview layer, we'll use a separate function to add the wms service
      // otherwise, use the total areas count to add interactive download layer(s)
      if (areaType === 'preview') {
        this.createPreviewLayer(map, this.props.collection.wms_link);
      }
      // if < 2000 downloads, we know the map can perform so we'll just get them
      // all at once
      else if (total < 2000) {
        const allAreasString = areasList.join("','");
        const allAreasQuery = "SELECT * FROM area_type WHERE area_type_id IN ('" + allAreasString + "')";
        this.createLayers(allAreasQuery, map, "0", areaType, visibility);
      }
      // if more than 2000, we will get area_types to display on the map in chunks
      // since the carto api payload has a maximum limit
      else {
        let loop = 0;
        let s = 0;
        let e = 2000;
        // iterate resources in 2000 record chunks creating the polygon, hover, and label
        // layers for each chunk as separate 'chunk layers'
        while (s < total) {
          let chunk = areasList.slice(s, e);
          let chunkString = chunk.join("','");
          let chunkQuery = "SELECT * FROM area_type WHERE area_type_id IN ('" + chunkString + "')";
          this.createLayers(chunkQuery, map, loop.toString(), areaType, visibility);
          loop += 1;
          s += 2000;
          e += 2000;
        }
      }
      return areaType;
    }, this);
  }

  createPreviewLayer(map, wms_link) {
    // get capabilities url for ESRI AGS services append: ?service=WMS&request=getcapabilities
    // ESRI AGS service query. different from mapserver insofar as query "?" instead
    // of addition "&", also requires styles to be declared and layer chosen by #
    const url = wms_link + '?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&SRS=EPSG:3857&styles=default&width=256&height=256&layers=0';
    setTimeout(function () {
      map.addSource(
        'wms-preview',
        { type: 'raster', tiles: [url], tileSize: 256 }
      );
      map.addLayer({
        id: 'wms-preview-layer',
        type: 'raster',
        source: 'wms-preview',
        'layout': {'visibility': 'none'}
      });
    }, 500);
  }

  createLayers(query, map, loop, areaType, visibility) {
    // prepare carto tile api information
    var layerData = {
      user_name: 'tnris-flood',
      sublayers: [{
        sql: query,
        cartocss: '{}'
      }],
      maps_api_template: 'https://tnris-flood.carto.com'
    };

    const layerSourceName = areaType + '__area_type_source' + loop;
    const layerBaseName = areaType + '__area_type' + loop;

    // get the raster tiles from the carto api
    cartodb.Tiles.getTiles(layerData, function (result, error) {
      if (result == null) {
        console.log("error: ", error.errors.join('\n'));
        return;
      }
      // reformat the tile urls in the carto api response to convert them to
      // vector rather than raster tiles
      const areaTiles = result.tiles.map(function (tileUrl) {
        return tileUrl
          .replace('{s}', 'a')
          .replace(/.png/, '.mvt');
      });

      setTimeout(function () {
        // use the tiles from the response to add a source to the map
        map.addSource(layerSourceName, {
          'type': 'vector',
          'tiles': areaTiles,
          'promoteId': 'objectid'
        });

        /// add the area_type outline hover layer
        map.addLayer({
            id: layerBaseName + '__outline-hover',
            'type': 'line',
            'source': layerSourceName,
            'source-layer': 'layer0',
            'layout': {'visibility': 'visible'},
            'interactive': true,
            'paint': {
              'line-color': styles['selectedFeature'],
              'line-width': 2.5,
              'line-opacity': 1
            },
            'filter': ['==', 'area_type_name', '']
        }, 'boundary_country_inner');

        // add the area_type outline layer
        map.addLayer({
            id: layerBaseName + '__outline',
            'type': 'line',
            'source': layerSourceName,
            'source-layer': 'layer0',
            'layout': {'visibility': visibility},
            'interactive': true,
            'paint': {
              'line-color': styles['boundaryOutline'],
              'line-width': 1.5,
              'line-opacity': 1
            }
        }, layerBaseName + '__outline-hover');

        // add the area_type polygon layer
        map.addLayer({
            id: layerBaseName,
            'type': 'fill',
            'source': layerSourceName,
            'source-layer': 'layer0',
            'layout': {'visibility': visibility},
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
              'fill-opacity': .1            }
        }, layerBaseName + '__outline');
      }, 500);
    });

    // add the layer id's to the areaType's array in the layerRef for toggling
    this.layerRef[areaType].push(layerBaseName);

    // wire an on-click event to the area_type polygons to show a popup of
    // available resource downloads for clicked area
    const areaLookup = this.areaLookup;

    map.on('click', layerBaseName, function (e) {
      const clickedAreaId = e.features[0].properties.area_type_id;
      const clickedAreaName = e.features[0].properties.area_type_name;
      const downloads = areaLookup[clickedAreaId];
      let popupContent = "";
      // iterate available downloads for the area
      Object.keys(downloads).sort().map(abbr => {
        const dldInfo = downloads[abbr];
        // if a filesize is populated in the resource table so the popup,
        // we don't want to display empty popups, right?
        let filesizeString = "";
        if (dldInfo.filesize != null) {
          const filesize = parseFloat(dldInfo.filesize / 1000000).toFixed(2).toString();
          filesizeString = " - " + filesize + "MB";
        }
        // create html link and append to content string
        const dld = `<li><a href="${dldInfo.link}" target="_blank">${dldInfo.name}${filesizeString}</a></li>`;
        return popupContent += dld;
      });
      // create popup with constructed content string
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${clickedAreaName}</strong><ul>${popupContent}</ul>`)
        .addTo(map);
    });

    // toggle the layer symbology when the cursor enters a feature
    let hoveredStateId = null;
    map.on('mousemove', layerBaseName, function (e) {
      // Change the cursor to a pointer when it enters a boundary feature
      map.getCanvas().style.cursor = 'pointer';
      // Change the cursor to a pointer when it enters a boundary feature
      map.getCanvas().style.cursor = 'pointer';
      if (e.features.length > 0) {
        // check if the feature id > -1 because our feature ids start at 0
        if (hoveredStateId !== undefined) {
          // set the hover attribute to false with feature state
          map.setFeatureState({
            source: layerSourceName,
            sourceLayer: 'layer0',
            id: hoveredStateId
          }, {
            hover: false
          });
        }
        hoveredStateId = e.features[0].id;
        // set the hover attribute to true with feature state
        map.setFeatureState({
          source: layerSourceName,
          sourceLayer: 'layer0',
          id: hoveredStateId
        }, {
          hover: true
        });
      }
      // set the area_type outline hover layer filter
      map.setFilter(layerBaseName + '__outline-hover', ['==', 'area_type_name', e.features[0].properties.area_type_name]);
    });

    // toggle the layer symbology when the cursor leaves a feature
    map.on('mouseleave', layerBaseName, function () {
      // Undo the cursor pointer when it leaves a boundary feature
      map.getCanvas().style.cursor = '';
      if (hoveredStateId !== undefined) {
        // set the hover attribute to false with feature state
        map.setFeatureState({
          source: layerSourceName,
          sourceLayer: 'layer0',
          id: hoveredStateId
        }, {
          hover: false
        });
      }
      hoveredStateId = null;
      // reset the area_type outline hover layer filter
      map.setFilter(layerBaseName + '__outline-hover', ['==', 'area_type_name', '']);
    });
  }

  render() {
    const { errorResources, loadingResources } = this.props;
    const loadingMessage = (
      <div className='sweet-loading-animation'>
        <GridLoader
          sizeUnit={"px"}
          size={25}
          color={'#1E8DC1'}
          loading={true}
        />
      </div>
      );

    if (errorResources) {
      return <div>Error! {errorResources.message}</div>;
    }

    if (loadingResources) {
      return loadingMessage;
    }

    if (this.state.resourceLength === 0) {
      return (
        <div className='tnris-download-template-download'>
          <div className="tnris-download-template-download__none">
            Uh oh, we couldn't find the files to download. Please notify TNRIS using the contact form for this dataset.
          </div>
        </div>
      )
    }

    return (
      <div className='template-content-div tnris-download-template-download'>
        <div className='template-content-div-header mdc-typography--headline5'>
          Download
        </div>
        <div className='template-content-div-subheader mdc-typography--headline7'>
          Click a polygon in the map to download available data.
        </div>
        <div id='tnris-download-map'></div>
      </div>
    );
  }
}
