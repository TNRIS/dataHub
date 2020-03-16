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
            zoom: 4
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
        
        
        const mapfile = this.props.indexUrl.split("/")[this.props.indexUrl.split("/").length - 1]
        console.log(mapfile);
        const wmsLayer = mapfile.replace(/_/g, "").replace(/.map/g, "").toUpperCase();
        const rasterLayer = mapfile.replace(/.map/g, "");
        const boundaryLayer = mapfile.replace(/.map/g, "") + '_index';
        console.log(wmsLayer, rasterLayer, boundaryLayer);
        const indexUrl = this.props.indexUrl + '&bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=' + wmsLayer;
        console.log(indexUrl);
        map.on('load', function() {
            map.addSource('index-wms', {
                'type': 'raster',
                'tiles': [
                    indexUrl
                ],
                'tileSize': 256
            });
            map.addLayer(
                {
                'id': 'index-wms-layer',
                'type': 'raster',
                'source': 'index-wms',
                'paint': {}
                }
            );
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