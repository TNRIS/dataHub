import React from 'react';
import { GridLoader } from 'react-spinners';
import TnrisDownloadMapNote from './TnrisDownloadMapNote';

import mapboxgl from 'mapbox-gl';
import styles from '../../sass/index.scss';
// import loadingImage from '../../images/loading.gif';

// global sass breakpoint variables to be used in js
import breakpoints from '../../sass/_breakpoints.scss';

// the carto core api is a CDN in the app template HTML (not available as NPM package)
// so we create a constant to represent it so it's available to the component
const cartodb = window.cartodb;

export default class TnrisDownloadTemplateDownload extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        resourceLength: null,
        areaTypesLength: 1
      };
      // bind our map builder functions
      this.createMap = this.createMap.bind(this);
      this.createLayers = this.createLayers.bind(this);
      this.toggleLayers = this.toggleLayers.bind(this);
      this.layerRef = {};
      this.stateMinZoom = 5;
      this.qquadMinZoom = 8;
      this.downloadBreakpoint = parseInt(breakpoints.download, 10);
  }

  componentDidMount() {
    // on mount/load, try and launch the map. if the api response with the list
    // of downloadable resources hasn't returned we won't launch it
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
    if (this.props.collectionName.includes('NAIP') && areaType === 'qquad') {
      map.setMinZoom(this.qquadMinZoom);
    }
    else if (this.props.collectionName.includes('TOP') && areaType === 'qquad') {
      map.setMinZoom(this.qquadMinZoom);
    }
    else {
      map.setMinZoom(this.stateMinZoom);
    }
    // iterate layerRef for layers in map by areaType key
    Object.keys(this.layerRef).map(layer => {
      // if iteration is looking at the clicked layer in the menu, turn that
      // layer's layer id's on. otherwise, turn the that layer's layer id's off
      if (layer === areaType) {
        // iterate layer id's for clicked areaType and toggle their visibility
        this.layerRef[layer].map(layerName => {
          return map.setLayoutProperty(layerName, 'visibility', 'visible');
        }, this);
        // make the layer's menu button active by classname
        return document.querySelector('#dld-' + layer).className = 'mdc-list-item mdc-list-item--activated';
      }
      else {
        // iterate layer id's for clicked areaType and toggle their visibility
        this.layerRef[layer].map(layerName => {
          return map.setLayoutProperty(layerName, 'visibility', 'none');
        }, this);
        // make the layer's menu button active by classname
        return document.querySelector('#dld-' + layer).className = 'mdc-list-item';
      }
    }, this);
  }

  createMap() {
    // define mapbox map
    mapboxgl.accessToken = 'undefined';
    const map = new mapboxgl.Map({
        container: 'tnris-download-map', // container id
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [-99.341389, 31.330000],
        zoom: 6.1
    });
    this.map = map;
    // add those controls!
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
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
    // areaTypes length in state turns on display of layer menu if more than 1 layer
    if (areaTypesAry.length !== this.state.areaTypesLength) {
      this.setState({
        areaTypesLength:areaTypesAry.length
      });
    }

    // set initial minZoom
    // naip and top qquad layers get qqMinZoom, everything else is state zoom
    if (this.props.collectionName.includes('NAIP') && startLayer === 'qquad') {
      map.setMinZoom(this.qquadMinZoom);
    }
    else if (this.props.collectionName.includes('TOP') && startLayer === 'qquad') {
      map.setMinZoom(this.qquadMinZoom);
    }
    else {
      map.setMinZoom(this.stateMinZoom);
    }

    // reset layer menu in case of component update
    var menuItems = document.getElementById('tnris-download-menu');
    while (menuItems.firstChild) {
      menuItems.removeChild(menuItems.firstChild);
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
        // create the layer control in the DOM
        var link = document.createElement('a');
        link.href = '#';
        link.id = 'dld-' + areaType;
        link.textContent = areaType.toUpperCase();
        // determine if it is the active layer. apply the correct classes and
        // assign the visibility layoutProperty
        let linkClass;
        let visibility;
        switch (areaType === startLayer) {
          case true:
            linkClass = 'mdc-list-item mdc-list-item--activated';
            visibility = 'visible';
            // since this is our initial layer on display, we'll zoom to the bounds
            const areasString = areasList.join("','");
            const boundsQuery = "SELECT * FROM area_type WHERE area_type_id IN ('" + areasString + "')";
            const sql = new cartodb.SQL({ user: 'tnris-flood' });
            sql.getBounds(boundsQuery).done(function(bounds) {
              // set map to extent of download areas
              map.fitBounds([[bounds[1][1],bounds[1][0]],[bounds[0][1],bounds[0][0]]],{padding: 20});
            });
            break;
          default:
            linkClass = 'mdc-list-item';
            visibility = 'none';
        }
        link.className = linkClass;
        link.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleLayers(e, map, areaType);
        };
        // add areaType layer to layer menu
        menuItems.appendChild(link);

        // get total number of resources available for download
        const total = areasList.length;
        // if < 1000 downloads, we know the map can perform so we'll just get them
        // all at once
        if (total < 1000) {
          const allAreasString = areasList.join("','");
          const allAreasQuery = "SELECT * FROM area_type WHERE area_type_id IN ('" + allAreasString + "')";
          this.createLayers(allAreasQuery, map, "0", areaType, visibility);
        }
        // if more than 1000, we will get area_types to display on the map in chunks
        // since the carto api payload has a maximum limit
        else {
          let loop = 0;
          let s = 0;
          let e = 1000;
          // iterate resources in 1000 record chunks creating the polygon, hover, and label
          // layers for each chunk as separate 'chunk layers'
          while (s < total) {
            let chunk = areasList.slice(s, e);
            let chunkString = chunk.join("','");
            let chunkQuery = "SELECT * FROM area_type WHERE area_type_id IN ('" + chunkString + "')";
            this.createLayers(chunkQuery, map, loop.toString(), areaType, visibility);
            loop += 1;
            s += 1000;
            e += 1000;
          }
        }
        return areaType;
    }, this);
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
    const layerHoverName = areaType + '__area_type_hover' + loop;
    // const layerLabelName = areaType + '__area_type_label' + loop;
    const filler = this.props.theme + "Fill";
    const texter = this.props.theme + "Text";
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
          map.addSource(layerSourceName, { type: 'vector', tiles: areaTiles });
          // add the polygon area_type layer
          map.addLayer({
              id: layerBaseName,
              'type': 'fill',
              'source': layerSourceName,
              'source-layer': 'layer0',
              'layout': {'visibility': visibility},
              'paint': {
                'fill-color': styles[filler],
                'fill-opacity': .3,
                'fill-outline-color': styles[texter]
              }
          });
          // add the polygon area_type hover layer. wired below to toggle on hover
          map.addLayer({
              id: layerHoverName,
              'type': 'fill',
              'source': layerSourceName,
              'source-layer': 'layer0',
              'layout': {'visibility': visibility},
              'paint': {
                'fill-color': styles[filler],
                'fill-opacity': .7,
                'fill-outline-color': styles[texter]
              },
              'filter': ['==', 'area_type_name', '']
          }, layerBaseName);
          // add the labels layer for the area_type polygons
          // map.addLayer({
          //     id: layerLabelName,
          //     'type': 'symbol',
          //     'source': layerSourceName,
          //     'source-layer': 'layer0',
          //     // 'minzoom': 10,
          //     'layout': {
          //       "text-field": "{area_type_name}",
          //       'visibility': visibility
          //     },
          //     'paint': {
          //       "text-color": styles[texter]
          //     }
          // });
      }, 500);
    });
    // add the layer id's to the areaType's array in the layerRef for toggling
    // next line is legacy and is commented out to turn off labels
    // this.layerRef[areaType].push(layerBaseName, layerHoverName, layerLabelName);
    this.layerRef[areaType].push(layerBaseName, layerHoverName);

    // wire an on-click event to the area_type polygons to show a popup of
    // available resource downloads for clicked area
    const areaLookup = this.areaLookup;
    map.on('click', layerBaseName, function (e) {
      // console.log(e.lngLat);
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

    // Change the cursor to a pointer when it enters a feature in the 'area_type' layer
    // Also, toggle the hover layer with a filter based on the cursor
    map.on('mousemove', layerBaseName, function (e) {
      map.getCanvas().style.cursor = 'pointer';
      map.setFilter(layerHoverName, ['==', 'area_type_name', e.features[0].properties.area_type_name]);
    });
    // Undo the cursor pointer when it leaves a feature in the 'area_type' layer
    // Also, untoggle the hover layer with a filter
    map.on('mouseleave', layerBaseName, function () {
      map.getCanvas().style.cursor = '';
      map.setFilter(layerHoverName, ['==', 'area_type_name', '']);
    });
  }

  render() {
    if (window.innerWidth <= this.downloadBreakpoint) {
      window.scrollTo(0,0);
      return (
        <div className='tnris-download-template-download'>
          <div className="tnris-download-template-download__mobile">
            <p>
              Due to the average size of data downloads and in consideration of the map user experience,
              data downloads have been <strong>disabled</strong> for small browser windows and mobile devices.
            </p>
            <p>
              Please visit this page with a desktop computer or increase the browser window size and refresh
              the page to download this dataset.
            </p>
          </div>
        </div>
      )
    }

    const { errorResources, loadingResources } = this.props;
    const loadingMessage = (
      // <div className='tnris-download-template-download'>
      //   <div className="tnris-download-template-download__loading">
      //     <img src={loadingImage} alt="Holodeck Loading..." className="holodeck-loading-image" />
      //   </div>
      // </div>
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

    const menuDisplayClass = this.state.areaTypesLength > 1 ? 'mdc-list' : 'mdc-list hidden-layer-menu';

    return (
      <div className='tnris-download-template-download'>
        <nav id='tnris-download-menu' className={menuDisplayClass}></nav>
        <div id='tnris-download-map'></div>
        <TnrisDownloadMapNote />
      </div>
    );
  }
}
