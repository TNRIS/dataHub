import React from "react";
import { Box, Button, Divider, Drawer, List, ListSubheader } from "@material-ui/core";

import CollectionFilterContainer from "../containers/CollectionFilterContainer";
import CollectionSorterContainer from "../containers/CollectionSorterContainer";
import CollectionTimesliderContainer from "../containers/CollectionTimesliderContainer";

import ShareButtons from "./DialogTemplateListItems/ShareButtons";
import useToolDrawerStyles from "../cssInJs/_toolDrawer";

const ToolDrawer = (props) => {
  const classes = useToolDrawerStyles();

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
      <Box
        p={2}
        mx={-1}
        bgcolor="white"
        display="flex"
        position="sticky"
        zIndex="modal"
        flexDirection="row"
        justifyContent="center"
        top={0}
      >
        <span>
          {props.total !== 1
            ? `${props.total} Datasets Found`
            : `${props.total} Dataset Found`}
        </span>
      </Box>

      <List>
        <Box className={classes.drawerSection}>
          <CollectionSorterContainer
            className={"list-item " + classes.drawerSection}
          />
        </Box>
        <Box className={classes.drawerSection}>
          <CollectionFilterContainer className={"list-item "} />
        </Box>
        <Box className={classes.drawerSection}>
          <ListSubheader
            disableSticky={true}
            component="div"
            id="nested-list-subheader"
          >
            Date Range
          </ListSubheader>
          <CollectionTimesliderContainer className={"list-item"} />
        </Box>

        <Box
          className={"clear-all-filters-container " + classes.drawerSection}
          display="flex"
          justifyContent="center"
        >
          <Button
            variant="contained"
            size="small"
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
          </Button>
        </Box>
        {/* <ThemeChooserContainer /> */}
        <Box pt={4} pb={2}>
          <ShareButtons />
        </Box>
      </List>
    </Drawer>
  );
};

export default ToolDrawer;
