import React from 'react'
import mapboxgl from 'mapbox-gl'
import styles from '../../sass/index.scss'

export default class HistoricalAerialTemplateIndexDownload extends React.Component {
    constructor(props) {
      super(props);
      // bind our map builder functions
      this.createMap = this.createMap.bind(this);
      this.toggleLayers = this.toggleLayers.bind(this);
    }
  
    componentDidMount() {
      this.createMap();
    }
  
    componentWillUnmount() {
      this.map.remove();
    }

    toggleLayers (e, map, menuItemId) {
        // if popup is open, close it
        if (document.querySelector('.mapboxgl-popup')) {
          document.querySelector('.mapboxgl-popup').remove();
        }
        // toggle between boundary and raster based on clicked menuItem
        if (menuItemId === 'boundary-layer') {
            map.setLayoutProperty('boundary-layer', 'visibility', 'visible');
            map.setLayoutProperty('boundary-layer-hover', 'visibility', 'visible');
            map.setLayoutProperty('raster-layer', 'visibility', 'none');
            document.querySelector('#boundary-layer').className = 'mdc-list-item mdc-list-item--activated';
            document.querySelector('#raster-layer').className = 'mdc-list-item';
        } else {
            map.setLayoutProperty('boundary-layer', 'visibility', 'none');
            map.setLayoutProperty('boundary-layer-hover', 'visibility', 'none');
            map.setLayoutProperty('raster-layer', 'visibility', 'visible');
            document.querySelector('#boundary-layer').className = 'mdc-list-item';
            document.querySelector('#raster-layer').className = 'mdc-list-item mdc-list-item--activated';
        };
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
            map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
        }
        // 
        // START LAYER CONTROL
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
        if (!document.querySelector('.tnris-download-menu')) {
            map.addControl(ctrlMenu, 'top-right')
        }
        // add custom controls to map
        const menuItems = document.querySelector('#download-menu');
        // reset layer menu in case of component update
        if (menuItems) {
            while (menuItems.firstChild) {
                menuItems.removeChild(menuItems.firstChild);
            }
        }
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
        menuItems.appendChild(mvtMenuLink);
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
        menuItems.appendChild(wmsMenuLink);
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
        
        const filler = this.props.theme + "Fill";
        const texter = this.props.theme + "Text";
        
        map.on('load', function() {
            // use the tiles url query on index service to add source to the map
            map.addSource('index-boundary-mvt', { type: 'vector', tiles: [mvtUrl] });
            // add the index sheets polygon layer
            map.addLayer({
                id: 'boundary-layer',
                'type': 'fill',
                'source': 'index-boundary-mvt',
                'source-layer': boundaryLayer,
                'layout': {'visibility': 'visible'},
                'interactive': true,
                'paint': {
                    'fill-color': styles[filler],
                    'fill-opacity': .3,
                    'fill-outline-color': styles[texter]
                }
            });
            // add the index sheets polygon hover layer. wired below to toggle on hover
            map.addLayer({
                id: 'boundary-layer-hover',
                'type': 'fill',
                'source': 'index-boundary-mvt',
                'source-layer': boundaryLayer,
                'layout': {'visibility': 'visible'},
                'interactive': true,
                'paint': {
                    'fill-color': styles[filler],
                    'fill-opacity': .7,
                    'fill-outline-color': styles[texter]
                },
                'filter': ['==', 'oid', '']
            }, 'boundary-layer');
            // use the wms url query on index service to add source to the map
            map.addSource('index-raster-wms', { type: 'raster', tiles: [wmsRasterUrl], tileSize: 256 });
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
                if (a.properties.frame_num < b.properties.frame_num)
                    return -1;
                if (a.properties.frame_num > b.properties.frame_num)
                    return 1;
                return 0;
            }
            const ordered = e.features.sort(compare);
            // iterate all features to populate
            // details of all features clicked into popup
            let popupContent = "";
            ordered.forEach(f => {
                const countyPathSlot = f.properties.dl_orig.split("/")[5];
                const county = countyPathSlot != 'MultiCounty' ? ' - ' + countyPathSlot : '';
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

        // Change the cursor to a pointer when it enters a feature in the 'boundary-layer' layer
        // Also, toggle the hover layer with a filter based on the cursor
        map.on('mousemove', 'boundary-layer', function (e) {
            map.getCanvas().style.cursor = 'pointer';
            map.setFilter('boundary-layer-hover', ['==', 'oid', e.features[0].properties.oid]);
        });
        // Undo the cursor pointer when it leaves a feature in the 'area_type' layer
        // Also, untoggle the hover layer with a filter
        map.on('mouseleave', 'boundary-layer', function () {
            map.getCanvas().style.cursor = '';
            map.setFilter('boundary-layer-hover', ['==', 'oid', '']);
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