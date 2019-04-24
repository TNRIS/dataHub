import React from 'react';


export default class OeServices extends React.Component {

  render() {

    // create service name and url arrays from aggregated string
    const namesArray = this.props.collection.oe_service_names !== null ? this.props.collection.oe_service_names.split(', ') : [];
    const servicesArray = this.props.collection.oe_service_urls !== null ? this.props.collection.oe_service_urls.split(', ') : [];

    const servicesObj = {};

    namesArray.map((key) => {
      const compare = key.split(' ').join('_');
      servicesArray.map((service) => {
        const stringArray = service.split("/");
        stringArray.map((i) => {
          if (i === compare) {
            servicesObj[key] = servicesArray[servicesArray.indexOf(service)];
          }
          return i;
        })
        return service;
      })
      return key;
    });

    const displayServices = () => {
      let element = document.getElementById("service-list");
      element.classList.toggle("show-services");
    };

    const services = namesArray.length !== 0 ? (
      <div id="oe_services">
        <div className="collapse mdc-button mdc-button--raised mdc-ripple-upgraded" onClick={displayServices}>
          <p>
            Currently, there are <u>{namesArray.length}</u> available services from <u>{this.props.collection.source_abbreviation}</u>. <strong>Click this button</strong> to 
            view a list of services that you can access by visiting the agency's <a href={this.props.collection.source_data_website} target="_blank">open data portal</a>.
          </p>
        </div>
        <div id="service-list" className="content">
          <ul className="mdc-list mdc-list--non-interactive">
            {
              Object.entries(servicesObj).map((i) => {
                let key = i[0];
                return <li className="mdc-list-item" role="menuitem" key={key}>
                  <span className="mdc-list-item__text" title={key}>{key}</span>
                </li>;
              })
            }
          </ul>
        </div>
      </div>
      ) : '';


    return (
      <div className="template-content-div">
        {services}
      </div>
    )
  }
}
