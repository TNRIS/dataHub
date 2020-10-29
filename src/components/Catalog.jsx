import React, { useEffect, useState } from "react";
import { Redirect } from "react-router";
import { Route, Switch } from "react-router";
import { matchPath } from "react-router-dom";

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
import { Box, Container, Fab, Grid, Icon, Snackbar } from "@material-ui/core";
import SweetLoadingScreen from "./SweetLoadingScreen";

import useCatalogStyles from "../cssInJs/_catalog";

const Catalog = (props) => {
  const classes = useCatalogStyles();

  const [toTopDisplay, setToTopDisplay] = useState("no");
  const [snackPack, setSnackPack] = useState([]);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState(undefined);

  useEffect(() => {
    props.fetchCollections();
    props.fetchStoredShoppingCart();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", detectScroll);
    window.innerWidth >= parseInt(breakpoints.desktop, 10)
      ? props.setDismissibleDrawer()
      : props.setModalDrawer();
    window.onpopstate = (e) => {
      if (e.state) {
        const theState = e.state.state;
        props.popBrowserStore(theState);
      }
    };
    // apply theme
    // on component mount, check localstorage for theme to apply
    if (typeof Storage !== void 0) {
      const savedTheme = localStorage.getItem("data_theme")
        ? localStorage.getItem("data_theme")
        : null;
      if (savedTheme) {
        if (props.themeOptions.includes(savedTheme) || savedTheme === "satan") {
          props.setColorTheme(savedTheme);
        } else {
          localStorage.removeItem("data_theme");
        }
      }
    }

    return function cleanup() {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", detectScroll);
    };
  }, []);

  useEffect(() => {
    if (props.visibleCollections) {
      const msg =
        props.visibleCollections.length !== 1
          ? `${props.visibleCollections.length} datasets found`
          : `${props.visibleCollections.length} dataset found`;
      setSnackPack((prev) => [
        ...prev,
        { message: msg, key: new Date().getTime() },
      ]);
    }
  }, [props.visibleCollections]);

  useEffect(() => {
    if (snackPack.length && !snackMessage) {
      // Set a new snack when we don't have an active one
      setSnackMessage({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setSnackOpen(true);
    } else if (snackPack.length && snackMessage && snackOpen) {
      // Close an active snack when a new one is added
      setSnackOpen(false);
    }
  }, [snackPack, snackMessage, snackOpen]);

  const detectScroll = () => {
    window.pageYOffset > 500 ? setToTopDisplay("yes") : setToTopDisplay("no");
  };

  const scrollTop = () => {
    window.scrollTo(0, 0);
  };

  const handleToastClose = (event, reason) => {
    setSnackOpen(false);
  };

  const handleToastExited = () => {
    setSnackMessage(undefined);
  };

  const handleResize = () => {
    if (window.innerWidth >= parseInt(breakpoints.desktop, 10)) {
      props.setDismissibleDrawer();
    } else {
      props.setModalDrawer();
    }
  };

  const handleToolDrawerDisplay = () => {
    if (props.toolDrawerStatus === "open") {
      props.closeToolDrawer();
      return;
    }
    props.openToolDrawer();
  };

  const handleShowCollectionView = () => {
    if (props.selectedCollection) {
      let collection = props.collections[props.selectedCollection];
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
      const match = matchPath(props.history.location.pathname, {
        path: "/collection/:collectionId",
      });
      if (
        props.collections &&
        Object.keys(match.params).includes("collectionId")
      ) {
        if (
          !Object.keys(props.collections).includes(match.params.collectionId)
        ) {
          return <Redirect to="/404" />;
        }
      }
    }
  };

  const chunkCatalogCards = () => {
    let chunks = [];
    let loop = 0;
    let s = 0;
    let e = 900;
    while (s < props.visibleCollections.length) {
      let chunk = props.visibleCollections.slice(s, e);
      chunks.push(
        <Grid container alignItems={'stretch'} spacing={4} key={loop} count={loop}>
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
                collection={props.collections[collectionId]}
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
  };

  const setCatalogView = () => {
    const scrollTopButton =
      toTopDisplay === "yes" ? (
        <div className="scrolltop-container">
          <Fab
            className="scrolltop"
            aria-label="Back to top"
            onClick={scrollTop}
            title="Back to top"
          >
            <Icon>keyboard_arrow_up</Icon>
          </Fab>
        </div>
      ) : (
        ""
      );
    const catalogCards =
      props.visibleCollections && props.visibleCollections.length < 1 ? (
        <div className="no-data">
          <img
            src={props.theme !== "satan" ? noDataImage : noDataImage666}
            className="no-data-image"
            alt="No Data Available"
            title="No data available with those search terms"
          />
        </div>
      ) : !props.visibleCollections ? (
        <SweetLoadingScreen />
      ) : props.visibleCollections.length < 900 ? (
        <Container className={"catalog-grid"}>
          {scrollTopButton}
          <Grid container spacing={4}>
            {props.visibleCollections.map((collectionId, index) => (
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
                  collection={props.collections[collectionId]}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      ) : (
        <Container className={"catalog-grid"}>
          {scrollTopButton}
          {chunkCatalogCards()}
        </Container>
      );

    let drawerStatusClass = classes.closedDrawer;
    if (
      props.toolDrawerStatus === "open" &&
      props.toolDrawerVariant === "dismissible"
    ) {
      drawerStatusClass = classes.openDrawer;
    }
    const catalogView = (
      <Box className={`catalog typography ` + drawerStatusClass}>
        <ToolDrawerContainer
          total={props.visibleCollections ? props.visibleCollections.length : 0}
        />
        {catalogCards}
      </Box>
    );
    return catalogView;
  };

  const { error, loading } = props;

  if (error) {
    return <div>Error! {error.message}</div>;
  }

  if (loading) {
    return <SweetLoadingScreen />;
  }

  const viewClass =
    props.view === "catalog"
      ? "catalog-view-container"
      : "other-view-container";

  return (
    <div className="catalog-component">
      <HeaderContainer handleToolDrawerDisplay={handleToolDrawerDisplay} />

      <div className={viewClass}>
        <Switch>
          <Route
            path="/collection/:collectionId"
            exact
            render={(props) => handleShowCollectionView()}
          />
          <Route
            path="/catalog/:filters"
            exact
            render={(props) => setCatalogView()}
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
          <Route path="/" exact render={(props) => setCatalogView()} />
          <Route path="*" render={(props) => <NotFoundContainer />} />
        </Switch>
      </div>

      <FooterContainer />
      <Snackbar
        key={snackMessage ? snackMessage.key : undefined}
        className={"dataset-toaster"}
        open={snackOpen}
        message={snackMessage ? snackMessage.message : undefined}
        onClose={handleToastClose}
        onExited={handleToastExited}
        autoHideDuration={6000}
      />
    </div>
  );
};

export default Catalog;
