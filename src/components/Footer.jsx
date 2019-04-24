import React from 'react';
import { MDCMenu } from '@material/menu';

export default class Footer extends React.Component {
  constructor(props) {
      super(props);
      this.showLinkMenu = this.showLinkMenu.bind(this);
      this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  showLinkMenu(menuRef) {
    this.menu = new MDCMenu(this.refs[menuRef]);
    this.menu.open = !this.menu.open;
  }

  handleKeyPress (e, menuRef) {
    if (e.keyCode === 13 || e.keyCode === 32) {
      this.showLinkMenu(menuRef);
    }
  }

  render() {
    let drawerStatusClass = 'closed-drawer';
    if (this.props.view === 'catalog' &&
      this.props.toolDrawerVariant === 'dismissible' &&
      this.props.toolDrawerStatus === 'open') {
      drawerStatusClass = 'open-drawer';
    }

    return (
      <div className={`footer-component ${drawerStatusClass}`} id='master-footer'>
          <ul className="link-container" role="listbox">

            <li className="link-container-menu-list">
              <div className="mdc-menu-surface--anchor">
                <div className="link-menu-control"
                     onClick={() => this.showLinkMenu('legal_link_menu')}
                     onKeyDown={(e) => this.handleKeyPress(e, 'legal_link_menu')}
                     tabIndex="0">
                     <span>Legal</span>
                </div>
                <div ref="legal_link_menu" className="mdc-menu mdc-menu-surface">
                  <ul className="mdc-list inner-menu-link-list" role="listbox" aria-hidden="true">
                      <a className="mdc-list-item" href="https://tnris.org/site-policies#privacy-and-security-policy" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        Privacy/Security Policy
                      </a>
                      <a className="mdc-list-item" href="https://tnris.org/site-policies#accessibility-policy" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        Accessibility
                      </a>
                      <a className="mdc-list-item" href="http://www.twdb.texas.gov/home/open_records.asp" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        Open Records Request
                      </a>
                      <a className="mdc-list-item" href="http://www.twdb.texas.gov/home/compact_texan.asp" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        Compact with Texans
                      </a>
                      <a className="mdc-list-item" href="http://www.twdb.texas.gov/home/fraud.asp" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        Fraud &amp; Waste
                      </a>
                      <a className="mdc-list-item" href="https://www.tsl.texas.gov/trail/index.html" target="_blank" rel="noopener noreferrer" tabIndex="0">TRAIL</a>
                      <a className="mdc-list-item" href="http://www.texas.gov" target="_blank" rel="noopener noreferrer" tabIndex="0">Texas.gov</a>
                      <a className="mdc-list-item" href="http://www.twdb.texas.gov" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        Texas Water Development Board
                      </a>
                  </ul>
                </div>
              </div>
            </li>

            <li className="link-container-menu-list">
              <div className="mdc-menu-surface--anchor">
                <div className="link-menu-control"
                     onClick={() => this.showLinkMenu('copyright_menu')}
                     onKeyDown={(e) => this.handleKeyPress(e, 'copyright_menu')}
                     tabIndex="0">
                     <span>Copyright</span>
                </div>
                <div ref="copyright_menu" className="mdc-menu mdc-menu-surface">
                  <ul className="mdc-list inner-menu-link-list" aria-hidden="true">
                    <p className="nested-item">
                      Content of this site © Texas Natural Resources Information System and Texas Water Development Board unless otherwise noted.
                    </p>
                    <button className="mdc-button mdc-button--raised"
                            onClick={() => this.showLinkMenu('copyright_menu')}
                            onKeyDown={(e) => this.handleKeyPress(e, 'copyright_menu')}
                            tabIndex="0">
                      <i className="material-icons" alt="Close Copyright" title="Close Copyright">close</i>
                    </button>
                  </ul>
                </div>
              </div>
            </li>

            <li className="link-container-menu-list">
              <div className="mdc-menu-surface--anchor">
                <div className="link-menu-control"
                     onClick={() => this.showLinkMenu('contact_menu')}
                     onKeyDown={(e) => this.handleKeyPress(e, 'contact_menu')}
                     tabIndex="0">
                     <span>Contact</span>
                </div>
                <div ref="contact_menu" className="mdc-menu mdc-menu-surface">
                  <ul className="mdc-list inner-menu-link-list" aria-hidden="true">
                    <div className="nested-item location-item">
                      <span><strong>Location</strong></span>
                      <address>
                        1700 N. Congress<br />
                        Room B-40<br />
                        Austin, Texas, 78701
                      </address>
                      <small>
                        <a href="https://goo.gl/maps/RE5BC" target="_blank" rel="noopener noreferrer" tabIndex="0">
                          <i className="material-icons">open_in_new</i>View Map
                        </a>
                      </small>
                      <p>
                        <a href="tel:5124638337" tabIndex="0">
                          <i className="material-icons">phone</i>512-463-8337
                        </a>
                        <br />
                        <strong>RDC Office Hours:</strong><br />
                        Monday-Friday, 8am-4pm<br />
                        By Appointment Only
                      </p>
                    </div>
                  </ul>
                </div>
              </div>
            </li>

            <li className="link-container-menu-list">
              <div className="mdc-menu-surface--anchor">
                <div className="link-menu-control"
                     onClick={() => this.showLinkMenu('tnris_link_menu')}
                     onKeyDown={(e) => this.handleKeyPress(e, 'tnris_link_menu')}
                     tabIndex="0">
                     <span>Programs</span>
                </div>
                <div ref="tnris_link_menu" className="mdc-menu mdc-menu-surface">
                  <ul className="mdc-list inner-menu-link-list" role="listbox" aria-hidden="true">
                      <a className="mdc-list-item" href="https://tnris.org/maps-and-data/applications-and-utilities" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        Applications and Utilities
                      </a>
                      <a className="mdc-list-item" href="https://tnris.org/research-distribution-center" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        Research &amp; Distribution
                      </a>
                      <a className="mdc-list-item" href="https://tnris.org/stratmap" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        StratMap Program
                      </a>
                      <a className="mdc-list-item" href="https://tnris.org/training" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        Education &amp; Training
                      </a>
                      <a className="mdc-list-item" href="https://tnris.org/about" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        About Us
                      </a>
                      <a className="mdc-list-item" href="https://tnris.org/contact" target="_blank" rel="noopener noreferrer" tabIndex="0">
                        General Contact
                      </a>
                  </ul>
                </div>
              </div>
            </li>

          </ul>
      </div>
    );
  }
}
