import React from "react";
import { Drawer, List } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import CollectionFilterContainer from "../containers/CollectionFilterContainer";
import CollectionSorterContainer from "../containers/CollectionSorterContainer";
import CollectionTimesliderContainer from "../containers/CollectionTimesliderContainer";
import ThemeChooserContainer from "../containers/ThemeChooserContainer";

import ShareButtons from "./DialogTemplateListItems/ShareButtons";

const drawerWidth = 256;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
  },
  drawerPaper: {
    width: drawerWidth,
    top: 106,
  },
  drawerContainer: {
    overflow: "auto",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

const ToolDrawer = (props) => {
  const classes = useStyles();

  const clearAllFilters = () => {
    props.sortNew();
    props.setCollectionFilter({});
    props.setCollectionFilterMapAoi({});
    props.setCollectionFilterMapFilter([]);
    props.setCollectionFilterMapCenter({ lng: -99.341389, lat: 31.33 }); // the center of Texas
    props.setCollectionFilterMapZoom(5.3);
    props.setCollectionTimeslider(props.collectionTimesliderRange);
    props.setGeoSearcherInputValue("");
    props.setUrl("/");
    props.logFilterChange("/");
  };

  return (
    <Drawer
      className={classes.drawer}
      classes={{
        paper: classes.drawerPaper,
      }}
      open={props.toolDrawerStatus === "open" ? true : false}
      variant={"persistent"}
      anchor={"right"}
    >
      <div className="drawer__content" dir="ltr">
        <div className="drawer__header no-scroll">
          <div className="dataset-counter">
            <span>
              {props.total !== 1
                ? `${props.total} Datasets Found`
                : `${props.total} Dataset Found`}
            </span>
          </div>
        </div>

        <List>
          <CollectionSorterContainer className="list-item" />
          <div className="filter-title list-group__subheader">Filter</div>
          <CollectionFilterContainer className="list-item" />
          <div className="timeslider-title list-group__subheader">
            Date Range
          </div>
          <CollectionTimesliderContainer className="list-item" />
          <div className="clear-all-filters-container">
            <button
              className="button button--raised"
              onClick={() => clearAllFilters()}
              disabled={
                Object.keys(props.collectionFilter).length < 1 &&
                props.collectionFilterMapFilter.length < 1 &&
                !props.location.pathname.includes("range")
                  ? true
                  : false
              }
            >
              Clear All Filters
            </button>
          </div>
          <ThemeChooserContainer />
          <ShareButtons />
        </List>
      </div>
    </Drawer>
  );
};

export default ToolDrawer;
