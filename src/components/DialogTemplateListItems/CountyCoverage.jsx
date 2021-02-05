import React from 'react'
import mapboxgl from 'mapbox-gl'
import styles from '../../sass/index.module.scss'
import extent from 'turf-extent'

export default class CountyCoverage extends React.Component {
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
        container: 'county-coverage-map', // container id
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [-99.341389, 31.330000],
        zoom: 4
    });
    this.map = map;
    map.addControl(new mapboxgl.NavigationControl({
      showCompass: false
    }), 'top-left');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    const re = new RegExp(", ", 'g');
    const quotedCounties = this.props.counties.replace(re, "','");

    // get bounds and zoom map
    const geoJsonFeatures = 'https://mapserver.tnris.org/?map=/tnris_mapfiles/area_type.map&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=county_query&outputformat=geojson&SRSNAME=EPSG:4326&Counties=' + quotedCounties;
    fetch(geoJsonFeatures)
    .then(res => res.json())
    .then(json => {
      const bbox = extent(json);
      map.fitBounds(bbox,{padding: 20});
    })
    .catch(error => console.log(error));

    // get layer colors from sass styles export
    const filler = this.props.theme + "Fill";
    const texter = this.props.theme + "Text";

    const areaTiles = 'https://mapserver.tnris.org/?map=/tnris_mapfiles/area_type.map&mode=tile&tilemode=gmap&tile={x}+{y}+{z}&layers=county_query&map.imagetype=mvt&Counties=' + quotedCounties;
    setTimeout(function () {
        // use the tiles from the response to add a source to the map
        map.addSource('county-polygons-source', { type: 'vector', tiles: [areaTiles] });
        // add the polygon area_type layer
        map.addLayer({
            id: 'county-polygons',
            'type': 'fill',
            'source': 'county-polygons-source',
            'source-layer': 'county_query',
            'layout': {'visibility': 'visible'},
            'paint': {
              'fill-color': styles[filler],
              'fill-opacity': .3,
              'fill-outline-color': styles[texter]
            }
        });
        // add the polygon area_type hover layer. wired below to toggle on hover
        map.addLayer({
            id: 'county-polygons-hover',
            'type': 'fill',
            'source': 'county-polygons-source',
            'source-layer': 'county_query',
            'layout': {'visibility': 'visible'},
            'paint': {
              'fill-color': styles[filler],
              'fill-opacity': .7,
              'fill-outline-color': styles[texter]
            },
            'filter': ['==', 'area_type_name', '']
        }, 'county-polygons');
        // add the labels layer for the area_type polygons
        // map.addLayer({
        //     id: 'county-polygons-labels',
        //     'type': 'symbol',
        //     'source': 'county-polygons-source',
        //     'source-layer': 'layer0',
        //     // 'minzoom': 10,
        //     'layout': {
        //       "text-field": "{area_type_name}"
        //     },
        //     'paint': {
        //       "text-color": styles[texter]
        //     }
        // });

        map.on('click', 'county-polygons', function (e) {
          // console.log(e.lngLat);
          const clickedAreaName = e.features[0].properties.area_type_name;
          // create popup with constructed content string
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${clickedAreaName} County</strong>`)
            .addTo(map);
        });

        // Change the cursor to a pointer when it enters a feature in the 'area_type' layer
        // Also, toggle the hover layer with a filter based on the cursor
        map.on('mousemove', 'county-polygons', function (e) {
          map.getCanvas().style.cursor = 'pointer';
          map.setFilter('county-polygons-hover', ['==', 'area_type_name', e.features[0].properties.area_type_name]);
        });
        // Undo the cursor pointer when it leaves a feature in the 'area_type' layer
        // Also, untoggle the hover layer with a filter
        map.on('mouseleave', 'county-polygons', function () {
          map.getCanvas().style.cursor = '';
          map.setFilter('county-polygons-hover', ['==', 'area_type_name', '']);
        });
    }, 500);
  }

  render() {

    const downloadsDisabledNote = (
      this.props.template === 'tnris-download' ||
      (this.props.template === 'historical-aerial' && this.props.historicalIndexUrl && this.props.historicalIndexUrl !== "")
      ) ? (
      'Downloads have been disabled for smaller devices. Please use a device with a larger screen size to download data. '
    ) : "";

    return (

      <div className="template-content-div county-coverage-component">
        <div className='template-content-div-header mdc-typography--headline5'>
          Coverage Area
        </div>
        <div className='template-content-div-subheader mdc-typography--headline7'>
          {downloadsDisabledNote}Counties displayed in the map show general coverage for this dataset. Coverage may be incomplete and of varying quality.
        </div>
        <div id='county-coverage-map'></div>
        <div className='template-content-div-subheader mdc-typography--headline7'>
          <strong>Note:</strong> Data cannot be downloaded from this map, but can be ordered by clicking the 'Order' tab.
        </div>
      </div>
    )
  }
}
