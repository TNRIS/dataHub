import React from "react";
import { Redirect } from "react-router";
import { Route, Switch } from "react-router";
import { matchPath } from "react-router-dom";
import { MDCDialog } from "@material/dialog";
import { GridLoader } from "react-spinners";

import OutsideEntityTemplate from "./TnrisOutsideEntityTemplate/TnrisOutsideEntityTemplate";
import TnrisOrderTemplate from "./TnrisOrderTemplate/TnrisOrderTemplate";

import CollectionFilterMapViewContainer from "../containers/CollectionFilterMapViewContainer";
import FooterContainer from "../containers/FooterContainer";
import HeaderContainer from "../containers/HeaderContainer";
import ToolDrawerContainer from "../containers/ToolDrawerContainer";
import CatalogCardContainer from "../containers/CatalogCardContainer";
import HistoricalAerialTemplateContainer from "../containers/HistoricalAerialTemplateContainer";
import TnrisDownloadTemplateContainer from "../containers/TnrisDownloadTemplateContainer";
import OrderCartViewContainer from "../containers/OrderCartViewContainer";
import NotFoundContainer from "../containers/NotFoundContainer";

// import loadingImage from '../images/loading.gif';
import noDataImage from "../images/no-data.png";
import noDataImage666 from "../images/no-data-satan.png";

// global sass breakpoint variables to be used in js
import breakpoints from "../sass/_breakpoints.scss";
import { Container, Fab, Grid, Icon, Snackbar } from "@material-ui/core";

export default class Catalog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showButton: "no",
      snackOpen: false,
      snackMessage: undefined,
    };

    this.handleResize = this.handleResize.bind(this);
    this.handleToolDrawerDisplay = this.handleToolDrawerDisplay.bind(this);
    this.handleShowCollectionView = this.handleShowCollectionView.bind(this);
    this.setCatalogView = this.setCatalogView.bind(this);
    this.handleToast = this.handleToast.bind(this);
    this.handleToastClose = this.handleToastClose.bind(this);
    this.handleCloseBetaNotice = this.handleCloseBetaNotice.bind(this);
    this.chunkCatalogCards = this.chunkCatalogCards.bind(this);
    this.detectScroll = this.detectScroll.bind(this);
    this.scrollTop = this.scrollTop.bind(this);
    // this.loadingMessage = (
    //   <div className="catalog-component__loading">
    //     <img src={loadingImage} alt="Holodeck Loading..." className="holodeck-loading-image" />
    //   </div>
    // );
    this.loadingMessage = (
      <div className="sweet-loading-animation">
        <GridLoader
          sizeUnit={"px"}
          size={25}
          color={"#1E8DC1"}
          loading={true}
        />
      </div>
    );
  }

  componentDidMount() {
    this.props.fetchCollections();
    this.props.fetchStoredShoppingCart();
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("scroll", this.detectScroll);
    window.innerWidth >= parseInt(breakpoints.desktop, 10)
      ? this.props.setDismissibleDrawer()
      : this.props.setModalDrawer();
    window.onpopstate = (e) => {
      if (e.state) {
        const theState = e.state.state;
        this.props.popBrowserStore(theState);
      }
    };
    // apply theme
    // on component mount, check localstorage for theme to apply
    if (typeof Storage !== void 0) {
      const savedTheme = localStorage.getItem("data_theme")
        ? localStorage.getItem("data_theme")
        : null;
      if (savedTheme) {
        if (
          this.props.themeOptions.includes(savedTheme) ||
          savedTheme === "satan"
        ) {
          this.props.setColorTheme(savedTheme);
        } else {
          localStorage.removeItem("data_theme");
        }
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("scroll", this.detectScroll);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.theme !== this.props.theme) {
      const themedClass = this.props.theme + "-app-theme";
      const html = document.querySelector("html");
      html.className = themedClass;
    }
    if (prevProps.visibleCollections) {
      if (this.props.view === "catalog" || this.props.view === "geoFilter") {
        if (
          prevProps.visibleCollections.length !==
          this.props.visibleCollections.length
        ) {
          this.handleToast(
            this.props.visibleCollections.length !== 1
              ? `${this.props.visibleCollections.length} datasets found`
              : `${this.props.visibleCollections.length} dataset found`
          );
        }
      }
    }
  }

  detectScroll() {
    window.pageYOffset > 500
      ? this.setState((prevState) => ({ showButton: "yes" }))
      : this.setState((prevState) => ({ showButton: "no" }));
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }

  handleCloseBetaNotice() {
    this.betaDialog = new MDCDialog(document.querySelector(".mdc-dialog"));
    this.betaDialog.foundation_.adapter_.removeClass("mdc-dialog--open");
  }

  handleToast(labelText) {
    this.setState((prevState) => ({
      snackOpen: true,
      snackMessage: labelText
    }));
  }

  handleToastClose() {
    this.setState((prevState) => ({
      snackOpen: false,
      snackMessage: undefined
    }));
  }

  handleResize() {
    if (window.innerWidth >= parseInt(breakpoints.desktop, 10)) {
      this.props.setDismissibleDrawer();
    } else {
      this.props.setModalDrawer();
    }
  }

  handleToolDrawerDisplay() {
      if (this.props.toolDrawerStatus === "open") {
        this.props.closeToolDrawer();
        return;
      }
      this.props.openToolDrawer();
  }

  handleShowCollectionView() {
    if (this.props.selectedCollection) {
      let collection = this.props.collections[this.props.selectedCollection];
      switch (collection["template"]) {
        case "tnris-download":
          return <TnrisDownloadTemplateContainer collection={collection} />;
        case "tnris-order":
          return <TnrisOrderTemplate collection={collection} />;
        case "historical-aerial":
          return <HistoricalAerialTemplateContainer collection={collection} />;
        case "outside-entity":
          return <OutsideEntityTemplate collection={collection} />;
        default:
          return <TnrisDownloadTemplateContainer collection={collection} />;
      }
    } else {
      const match = matchPath(this.props.history.location.pathname, {
        path: "/collection/:collectionId",
      });
      if (
        this.props.collections &&
        Object.keys(match.params).includes("collectionId")
      ) {
        if (
          !Object.keys(this.props.collections).includes(
            match.params.collectionId
          )
        ) {
          return <Redirect to="/404" />;
        }
      }
    }
  }

  chunkCatalogCards() {
    let chunks = [];
    let loop = 0;
    let s = 0;
    let e = 900;
    while (s < this.props.visibleCollections.length) {
      let chunk = this.props.visibleCollections.slice(s, e);
      chunks.push(
        <Grid container spacing={4} key={loop} count={loop}>
          {chunk.map((collectionId, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={collectionId}
              idx={index}
            >
              <CatalogCardContainer
                collection={this.props.collections[collectionId]}
              />
            </Grid>
          ))}
        </Grid>
      );
      loop += 1;
      s += 900;
      e += 900;
    }
    return chunks;
  }

  setCatalogView() {
    const scrollTopButton =
      this.state.showButton === "yes" ? (
        <div className="scrolltop-container">
          <Fab
            className="scrolltop"
            aria-label="Back to top"
            onClick={this.scrollTop}
            title="Back to top"
          >
            <Icon>keyboard_arrow_up</Icon>
          </Fab>
        </div>
      ) : (
        ""
      );
    const catalogCards =
      this.props.visibleCollections &&
      this.props.visibleCollections.length < 1 ? (
        <div className="no-data">
          <img
            src={this.props.theme !== "satan" ? noDataImage : noDataImage666}
            className="no-data-image"
            alt="No Data Available"
            title="No data available with those search terms"
          />
        </div>
      ) : !this.props.visibleCollections ? (
        this.loadingMessage
      ) : this.props.visibleCollections.length < 900 ? (
        <Container className={"catalog-grid"}>
          {scrollTopButton}
          <Grid container spacing={4}>
            {this.props.visibleCollections.map((collectionId, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={collectionId}
                idx={index}
              >
                <CatalogCardContainer
                  collection={this.props.collections[collectionId]}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      ) : (
        <Container className={"catalog-grid"}>
          {scrollTopButton}
          {this.chunkCatalogCards()}
        </Container>
      );

    let drawerStatusClass = "closed-drawer";
    if (
      this.props.toolDrawerStatus === "open" &&
      this.props.toolDrawerVariant === "dismissible"
    ) {
      drawerStatusClass = "open-drawer";
    }
    const catalogView = (
      <div className={`catalog typography ${drawerStatusClass}`}>
        <ToolDrawerContainer
          total={
            this.props.visibleCollections
              ? this.props.visibleCollections.length
              : 0
          }
        />
        {catalogCards}
      </div>
    );
    return catalogView;
  }

  render() {
    // Here lies the beta notice dialog. To remove the notice, remove the reference to this variable
    // in the returned codeblock below under the 'catalog-component'.
    // const betaDialog = (
    //   <div className="beta-notice-dialog mdc-dialog mdc-dialog--open"
    //        role="alertdialog"
    //        aria-modal="true"
    //        aria-labelledby="beta-warning"
    //        aria-describedby="my-dialog-content">
    //     <div className="mdc-dialog__container">
    //       <div className="mdc-dialog__surface">
    //         <h2 className="mdc-dialog__title" id="my-dialog-title">Howdy Y'all!</h2>
    //         <div className="mdc-dialog__content" id="my-dialog-content">
    //           {`This application is currently in beta, so mosy on over to `}<a href='https://tnris.org/'>tnris.org</a>
    //           {` if'n you're afraid of tanglin' with a few breachy bugs. YEE-HAW!`}
    //         </div>
    //         <footer className="mdc-dialog__actions">
    //           <button type="button"
    //                   className="mdc-button mdc-button--raised"
    //                   data-mdc-dialog-action="close"
    //                   onClick={this.handleCloseBetaNotice}
    //                   onKeyPress={(e) => e.keyCode === 13 || e.keyCode === 32 ? this.handleCloseBetaNotice() : null}
    //                   autoFocus>
    //             <span className="mdc-button__label">OK</span>
    //           </button>
    //         </footer>
    //       </div>
    //     </div>
    //     <div className="mdc-dialog__scrim"></div>
    //   </div>
    // );

    const { error, loading } = this.props;

    if (error) {
      return <div>Error! {error.message}</div>;
    }

    if (loading) {
      return this.loadingMessage;
    }

    const viewClass =
      this.props.view === "catalog"
        ? "catalog-view-container"
        : "other-view-container";

    return (
      <div className="catalog-component">
        {/*{betaDialog}*/}

        <HeaderContainer
          handleToolDrawerDisplay={this.handleToolDrawerDisplay}
        />

        <div className={viewClass}>
          <Switch>
            <Route
              path="/collection/:collectionId"
              exact
              render={(props) => this.handleShowCollectionView()}
            />
            <Route
              path="/catalog/:filters"
              exact
              render={(props) => this.setCatalogView()}
            />
            <Route
              path="/cart/"
              exact
              render={(props) => <OrderCartViewContainer />}
            />
            <Route
              path="/geofilter/"
              exact
              render={(props) => <CollectionFilterMapViewContainer />}
            />
            <Route path="/" exact render={(props) => this.setCatalogView()} />
            <Route path="*" render={(props) => <NotFoundContainer />} />
          </Switch>
        </div>

        <FooterContainer />

        <Snackbar
          className={"dataset-toaster"}
          open={this.state.snackOpen}
          message={this.state.snackMessage}
          onClose={this.handleToastClose}
          autoHideDuration={10000}
        />
      </div>
    );
  }
}
