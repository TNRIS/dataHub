import React from 'react';
import {MDCDrawer} from "@material/drawer";
import tnrisLogo from '../images/tnris_globe.png';
import twdbLogo from '../images/twdb_splash_icon.png';

export default class Drawer extends React.Component {

  constructor(props) {
      super(props);
      this.closeDrawer = this.closeDrawer.bind(this);
  }

  componentDidMount() {
    this.menuDrawer = MDCDrawer.attachTo(document.querySelector('.menu-drawer'));
  }

  closeDrawer () {
    this.menuDrawer.open = false;
  }

  render() {
    return (
      <div className="drawer-component">
        <aside className="menu-drawer mdc-drawer mdc-drawer--modal">

          <div className="mdc-drawer__content">
            <nav className="mdc-list">
              <a className="mdc-list-item" href="https://tnris.org/maps-and-data" aria-hidden="true">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">explore</i>Maps &amp; Data
              </a>
              <a className="mdc-list-item" href="https://tnris.org/geographic-information-office">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">account_circle</i>Geographic Information Office
              </a>
              <a className="mdc-list-item" href="https://tnris.org/texas-imagery-service">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">satellite</i>Texas Imagery Service
              </a>

              <hr className="mdc-list-divider" />

              <a className="mdc-list-item" href="https://tnris.org/stratmap">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">map</i>Strategic Mapping Program
              </a>
              <a className="mdc-list-item" href="https://tnris.org/stratmap/stratmap-contracts">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">edit</i>StratMap Contracts
              </a>
              <a className="mdc-list-item" href="https://tnris.org/stratmap/elevation-lidar">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">terrain</i>StratMap Elevation|Lidar
              </a>
              <a className="mdc-list-item" href="https://tnris.org/stratmap/orthoimagery">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">satellite</i>StratMap Orthoimagery
              </a>

              <hr className="mdc-list-divider" />

              <a className="mdc-list-item" href="https://tnris.org/research-distribution-center">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">timeline</i>Research &amp; Distribution Center
              </a>
              <a className="mdc-list-item" href="https://tnris.org/research-distribution-center/historical-imagery-archive">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">archive</i>Historical Imagery Archive
              </a>
              <a className="mdc-list-item" href="https://tnris.org/research-distribution-center/custom-maps">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">place</i>Custom Maps
              </a>

              <hr className="mdc-list-divider" />

              <a className="mdc-list-item" href="https://tnris.org/education">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">school</i>Education and Training
              </a>
              <a className="mdc-list-item" href="https://tnris.org/education/gis-mentorship">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">group</i>GIS Mentorships
              </a>
              <a className="mdc-list-item" href="https://tnris.org/education/purchasers">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">account_balance</i>Purchaser Resources
              </a>

              <hr className="mdc-list-divider" />

              <a className="mdc-list-item" href="https://tnris.org/about">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">info</i>About
              </a>
              <a className="mdc-list-item" href="https://tnris.org/contact">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">contact_mail</i>Contact Us
              </a>
              <a className="mdc-list-item" href="https://tnris.org">
                <img src={tnrisLogo} className="mdc-list-item__graphic tnris-logo" alt="TNRIS Logo" aria-hidden="true" />Texas Natural Resoources Information System
              </a>
              <a className="mdc-list-item" href="http://www.twdb.texas.gov/">
                <img src={twdbLogo} className="mdc-list-item__graphic twdb-logo" alt="TWDB Logo" aria-hidden="true" />Texas Water Development Board
              </a>
              <a className="mdc-list-item mdc-list-item--activated close-button" onClick={() => this.closeDrawer()} aria-selected="true">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">close</i>Close
              </a>
            </nav>
          </div>
        </aside>
        <div className="mdc-drawer-scrim"></div>
      </div>
    );
  }
}
