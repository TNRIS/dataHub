import React from "react";
import { MDCDrawer } from "@material/drawer";

import CollectionFilterContainer from "../containers/CollectionFilterContainer";
import CollectionSorterContainer from "../containers/CollectionSorterContainer";
import CollectionTimesliderContainer from "../containers/CollectionTimesliderContainer";
import ThemeChooserContainer from "../containers/ThemeChooserContainer";

import ShareButtons from "./DialogTemplateListItems/ShareButtons";

export default class ToolDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.clearAllFilters = this.clearAllFilters.bind(this);
    this.state = {
      contact: false,
    };
  }

  componentDidMount() {
    this.toolDrawer = MDCDrawer.attachTo(
      document.querySelector(".tool-drawer")
    );
  }

  clearAllFilters() {
    this.props.sortNew();
    this.props.setCollectionFilter({});
    this.props.setCollectionFilterMapAoi({});
    this.props.setCollectionFilterMapFilter([]);
    this.props.setCollectionFilterMapCenter({ lng: -99.341389, lat: 31.33 }); // the center of Texas
    this.props.setCollectionFilterMapZoom(5.3);
    this.props.setCollectionTimeslider(this.props.collectionTimesliderRange);
    this.props.setGeoSearcherInputValue("");
    this.props.setUrl("/");
    this.props.logFilterChange("/");
  }

  render() {
    const drawerTypeClass =
      this.props.toolDrawerVariant === "dismissible"
        ? "mdc-drawer mdc-drawer--dismissible tool-drawer"
        : "mdc-drawer mdc-drawer--modal tool-drawer";
    const openClass =
      this.props.toolDrawerVariant === "dismissible" &&
      this.props.toolDrawerStatus === "open"
        ? "mdc-drawer--open"
        : "";

    return (
      <div className="tool-drawer-component mdc-typography">
        <aside className={`${drawerTypeClass} ${openClass}`} dir="rtl">
          <div className="mdc-drawer__content" dir="ltr">
            <div className="mdc-drawer__header no-scroll">
              <div className="dataset-counter">
                <span>
                  {this.props.total !== 1
                    ? `${this.props.total} Datasets Found`
                    : `${this.props.total} Dataset Found`}
                </span>
              </div>
            </div>

            <nav className="mdc-list-group scroll">
              <div className="sort-title mdc-list-group__subheader">Sort</div>
              <CollectionSorterContainer className="mdc-list-item" />
              <div className="filter-title mdc-list-group__subheader">
                Filter
              </div>
              <CollectionFilterContainer className="mdc-list-item" />
              <div className="timeslider-title mdc-list-group__subheader">
                Date Range
              </div>
              <CollectionTimesliderContainer className="mdc-list-item" />
              <div className="clear-all-filters-container">
                <button
                  className="mdc-button mdc-button--raised"
                  onClick={this.clearAllFilters}
                  disabled={
                    Object.keys(this.props.collectionFilter).length < 1 &&
                    this.props.collectionFilterMapFilter.length < 1 &&
                    !this.props.location.pathname.includes("range")
                      ? true
                      : false
                  }
                >
                  Clear All Filters
                </button>
              </div>
              <ThemeChooserContainer />
              <ShareButtons />
              <br />
              <div className="mdc-touch-target-wrapper general-contact-button-wrapper centered">
                <div onClick={ () => {
                  this.props.setViewAbout()
                  this.props.setUrl("/help")
                }}>
                  <button className="mdc-button mdc-button--outlined button">
                    <div className="mdc-button__ripple"></div>
                    <span className="mdc-button__label">Help</span>
                    <div className="mdc-button__touch"></div>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {this.props.toolDrawerVariant === "modal" ? (
          <div className="mdc-drawer-scrim" id="scrim"></div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
