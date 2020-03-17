import React from 'react'
import mapboxgl from 'mapbox-gl'
// import styles from '../../sass/index.scss'

export default class HistoricalAerialTemplateIndexDownload extends React.Component {
    constructor(props) {
      super(props);
      // bind our map builder functions
      this.createMap = this.createMap.bind(this);
    }
  
    componentDidMount() {
      this.createMap();
    }
  
    componentWillUnmount() {
      this.map.remove();
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
        // add regular out-of-the-box controls if they dont already exist
        // prevents stacking/duplicating controls on component update
        if (!document.querySelector('.mapboxgl-ctrl-zoom-in')) {
            map.addControl(new mapboxgl.NavigationControl({
                showCompass: false
            }), 'top-left');
        }
        if (!document.querySelector('.mapboxgl-ctrl-fullscreen')) {
            map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        }
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
        // add wms service layers
        // const mapfile = this.props.indexUrl.split("/")[this.props.indexUrl.split("/").length - 1]
        // const wmsLayer = mapfile.replace(/_/g, "").replace(/.map/g, "").toUpperCase();
        const rasterLayer = this.props.serviceLayer + '_index';
        const boundaryLayer = this.props.serviceLayer + '_index_index';
        const baseUrl = this.props.indexUrl + '&bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=';
        // const filler = this.props.theme + "Fill";
        // const texter = this.props.theme + "Text";
        const filler = "lightFill";
        const texter = "lightText";
        map.on('load', function() {
            // create sources, add layers
            // raster layer
            map.addSource('index-raster-wms', {
                type: 'raster',
                tiles: [
                    baseUrl + rasterLayer
                ],
                tileSize: 256
            });
            map.addLayer(
                {
                    id: 'raster-layer',
                    type: 'raster',
                    source: 'index-raster-wms',
                    paint: {}
                }
            );
            // boundary layer
            map.addSource('index-boundary-wms', {
                type: 'raster',
                tiles: [
                    baseUrl + boundaryLayer
                ],
                tileSize: 256
            });
            map.addLayer(
                {
                    id: 'boundary-layer',
                    type: 'raster',
                    source: 'index-boundary-wms',
                    paint: {}
                }
            );
        });
        // popup
        map.on('click', 'boundary-layer', function (e) {
            console.log(e);
            console.log(e.features);
        // const clickedAreaId = e.features[0].properties.area_type_id;
        // const clickedAreaName = e.features[0].properties.area_type_name;
        // const downloads = areaLookup[clickedAreaId];
        // let popupContent = "";
        // // iterate available downloads for the area
        // Object.keys(downloads).sort().map(abbr => {
        //   const dldInfo = downloads[abbr];
        //   // if a filesize is populated in the resource table so the popup,
        //   // we don't want to display empty popups, right?
        //   let filesizeString = "";
        //   if (dldInfo.filesize != null) {
        //     const filesize = parseFloat(dldInfo.filesize / 1000000).toFixed(2).toString();
        //     filesizeString = " - " + filesize + "MB";
        //   }
        //   // create html link and append to content string
        //   const dld = `<li><a href="${dldInfo.link}" target="_blank">${dldInfo.name}${filesizeString}</a></li>`;
        //   return popupContent += dld;
        // });
        // // create popup with constructed content string
        // new mapboxgl.Popup()
        //   .setLngLat(e.lngLat)
        //   .setHTML(`<strong>${clickedAreaName}</strong><ul>${popupContent}</ul>`)
        //   .addTo(map);
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