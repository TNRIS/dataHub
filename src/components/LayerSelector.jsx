import React from 'react'
import {MDCFormField} from '@material/form-field';
import {MDCRadio} from '@material/radio';

export default class LayerSelector extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        if (document.querySelector('.mdc-radio')) {
            document.querySelectorAll('.mdc-radio').forEach((mr) => {
                const radio = new MDCRadio(mr);
                const formField = new MDCFormField(mr.parentNode);
                formField.input = radio;
                if (radio.value === this.props.startLayer) {
                    radio.checked = true;
                }
            });
        }
    }

    handleChange(event) {
        this.props.handler(event, this.props.map, event.target.value);
    }

    render() {
        return (
            <div>
                {
                this.props.areaTypes.map(areaType => {
                    return (
                        <div key={areaType} id={areaType + "-wrapper"} className="mdc-form-field">
                            <div className="mdc-radio">
                                <input className="mdc-radio__native-control"
                                        type="radio"
                                        id={areaType + "-radio-input"}
                                        name="layer-selector"
                                        value={areaType}
                                        onChange={this.handleChange}
                                        />
                                <div className="mdc-radio__background">
                                    <div className="mdc-radio__outer-circle"></div>
                                    <div className="mdc-radio__inner-circle"></div>
                                </div>
                            </div>
                            <label htmlFor={areaType + "-radio-input"}>{areaType.toUpperCase()}</label>
                        </div>
                    );
                })
                }
            </div>
        )
    }
}