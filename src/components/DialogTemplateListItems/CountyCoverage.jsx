import React from 'react';
import mapboxgl from 'mapbox-gl';
import styles from '../../sass/index.scss';
// the carto core api is a CDN in the app template HTML (not available as NPM package)
// so we create a constant to represent it so it's available to the component
const cartodb = window.cartodb;

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
    // add those controls!
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    const re = new RegExp(", ", 'g');
    const quotedCounties = this.props.counties.replace(re, "','");
    const query = "SELECT * FROM area_type WHERE area_type = 'county' and area_type_name IN ('" + quotedCounties + "')";

    // prepare carto tile api information
    var layerData = {
        user_name: 'tnris-flood',
        sublayers: [{
                sql: query,
                cartocss: '{}'
            }],
        maps_api_template: 'https://tnris-flood.carto.com'
    };

    const sql = new cartodb.SQL({ user: 'tnris-flood' });
    sql.getBounds(query).done(function(bounds) {
      // set map to extent of download areas
      map.fitBounds([[bounds[1][1],bounds[1][0]],[bounds[0][1],bounds[0][0]]],{padding: 20});
    });

    // get layer colors from sass styles export
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
            map.addSource('county-polygons-source', { type: 'vector', tiles: areaTiles });
            // add the polygon area_type layer
            map.addLayer({
                id: 'county-polygons',
                'type': 'fill',
                'source': 'county-polygons-source',
                'source-layer': 'layer0',
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
                'source-layer': 'layer0',
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
    });
  }

  render() {
    window.scrollTo(0,0);
    return (
      <div className="county-coverage-component">
        <div id='county-coverage-notice' className='mdc-typography--body1'>
          Imagery may have incomplete coverage for a particular county and may be of varying quality.
        </div>
        <div id='county-coverage-map'></div>
      </div>
    )
  }
}
