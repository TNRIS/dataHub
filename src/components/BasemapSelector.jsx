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
        const basemapSwitch = new MDCSwitch(document.querySelector('.mdc-switch'));
        basemapSwitch.checked = false;
    }

    handleChange(event) {
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
            <div>
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
                    <label htmlFor="basemap-selector-input">{this.state.label}</label>
                </div>
            </div>
        )
    }
}