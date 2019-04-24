import React from 'react';
import {MDCTopAppBar} from '@material/top-app-bar/index';
import {MDCTabBar} from '@material/tab-bar';
import { MDCMenu } from '@material/menu';

import TnrisOutsideEntityTemplateDetails from './TnrisOutsideEntityTemplateDetails';
import ContactOutsideContainer from '../../containers/ContactOutsideContainer';

export default class TnrisOutsideEntityTemplate extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        view:'details'
      };
      this.setTemplateView = this.setTemplateView.bind(this);
      this.showTabMenu = this.showTabMenu.bind(this);
  }

  componentDidMount() {
    this.topAppBarElement = document.querySelector('.mdc-top-app-bar');
    this.topAppBar = new MDCTopAppBar(this.topAppBarElement);
    this.tabBar = new MDCTabBar(document.querySelector('.mdc-tab-bar'));
    window.scrollTo(0,0);
  }

  setTemplateView(viewString) {
    this.setState({view: viewString});
    let tabIndex;
    switch(viewString) {
      case 'details':
        tabIndex = 0;
        break;
      case 'contact':
        tabIndex = 1;
        break;
      default:
        tabIndex = 0;
    }
    this.tabBar.activateTab(tabIndex);
  }

  showTabMenu() {
    this.menu = new MDCMenu(this.refs.tab_menu);
    this.menu.open = true;
  }

  render() {

    let showComponent;

    switch(this.state.view) {
      case 'details':
        showComponent = <TnrisOutsideEntityTemplateDetails collection={this.props.collection} />;
        break;
      case 'contact':
        showComponent = (
          <div className='tnris-download-template-details'>
            <div className="template-content-div">
              <div>
                <ContactOutsideContainer collection={this.props.collection}/>
              </div>
            </div>
          </div>
        )
        break;
      default:
        showComponent = <TnrisOutsideEntityTemplateDetails collection={this.props.collection} />;
    }


    return (

      <div className='outside-entity-template' tabIndex='0'>
        <header className="mdc-top-app-bar">
          <div className="mdc-top-app-bar__row">

            <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
              <span className="mdc-top-app-bar__title">
                {this.props.collection.name}
              </span>
            </section>

            <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">

              <div className="mdc-tab-bar" role="tablist">

                <div className="mdc-tab-scroller mdc-tab-scroller--align-end">
                  <div className="mdc-tab-scroller__scroll-area">
                    <div className="mdc-tab-scroller__scroll-content">

                      <button className="mdc-tab mdc-tab--active" role="tab" aria-selected="true" tabIndex="0" onClick={() => this.setTemplateView("details")} title="Details">
                        <span className="mdc-tab__content">details
                          {/*<span className="mdc-tab__icon material-icons">details</span>*/}
                        </span>
                        <span className="mdc-tab-indicator mdc-tab-indicator--active">
                          <span className="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
                        </span>
                        <span className="mdc-tab__ripple"></span>
                      </button>

                      <button className="mdc-tab" role="tab" aria-selected="false" tabIndex="-1"  onClick={() => this.setTemplateView("contact")} title="Contact">
                        <span className="mdc-tab__content">contact
                          {/*<span className="mdc-tab__icon material-icons">contact_support</span>*/}
                        </span>
                        <span className="mdc-tab-indicator">
                          <span className="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
                        </span>
                        <span className="mdc-tab__ripple"></span>
                      </button>

                    </div>
                  </div>
                </div>

              </div>

              <div className="mdc-menu-surface--anchor">
                <div onClick={this.showTabMenu} className="mdc-top-app-bar__action-item">
                  <i className="material-icons mdc-top-app-bar__navigation-icon">more_vert</i>
                </div>
                <div ref="tab_menu" className="mdc-menu mdc-menu-surface">
                  <nav className="mdc-list">
                    <div className={this.state.view === 'details' ? 'mdc-list-item  mdc-list-item--activated' : 'mdc-list-item'}
                       onClick={() => this.setTemplateView("details")}>Details
                       {/*<i className="mdc-tab__icon material-icons">details</i>*/}
                    </div>
                    <div className={this.state.view === 'contact' ? 'mdc-list-item  mdc-list-item--activated' : 'mdc-list-item'}
                       onClick={() => this.setTemplateView("contact")}>Contact
                       {/*<i className="mdc-tab__icon material-icons">contact_support</i>*/}
                    </div>
                  </nav>
                </div>
              </div>

            </section>
          </div>
        </header>

        {showComponent}

      </div>
    );
  }
}
