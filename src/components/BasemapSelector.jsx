import React from 'react'
import {MDCSwitch} from '@material/switch'

export default class BasemapSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            label: 'Default',
            enabled: false,
        }
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        if (document.querySelector('.mdc-switch')) {
            const basemapSwitch = new MDCSwitch(document.querySelector('.mdc-switch'));
            basemapSwitch.checked = false;
        }

        this.props.map.on('load', () => {
            const satelliteUrl = 'https://webservices.tnris.org/arcgis/services/NAIP/NAIP18_NC_CIR_60cm/ImageServer/WMSServer?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=0';
            this.props.map.addSource(
                'satellite-basemap',
                { type: 'raster', tiles: [satelliteUrl], tileSize: 256 }
            );
            // add next to the tunnel_service_case layer so roads and other layers
            // draw on top of imagery; this order may change depending on preference
            this.props.map.addLayer({
                id: 'satellite-basemap-layer',
                type: 'raster',
                source: 'satellite-basemap',
                'layout': {'visibility': 'none'}
            }, 'tunnel_service_case');
        });
    }

    handleChange(event) {
        event.preventDefault();
        event.stopPropagation();
        const label = this.state.label === 'Default' ? 'Satellite' : 'Default';
        this.setState({
            label: label,
            enabled: !this.state.enabled
        });
        const display = label === 'Default' ? 'none' : 'visible';
        this.props.handler(event, this.props.map, display);
      }

    render() {
        return (
            <div className="mdc-form-field">
                <div className="mdc-switch" id="basemap-selector-switch">
                <div className="mdc-switch__track"></div>
                <div className="mdc-switch__thumb-underlay">
                    <div className="mdc-switch__thumb">
                    <input type="checkbox"
                            id="basemap-selector-input"
                            className="mdc-switch__native-control"
                            name="basemap-selector"
                            onChange={this.handleChange} />
                    </div>
                </div>
                </div>
                <label className={this.state.label} htmlFor="basemap-selector-input">{this.state.label}</label>
            </div>
        )
    }
}