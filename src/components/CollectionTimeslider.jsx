import React, { useState, useEffect } from "react";
import { matchPath } from "react-router-dom";
import { Box, ListItem, Slider, Typography } from "@material-ui/core";
import useCollectionTimesliderStyles from "../cssInJs/_collectionTimeslider";

function AirbnbThumbComponent(props) {
  return (
    <span {...props}>
      <span className="bar" />
      <span className="bar" />
      <span className="bar" />
    </span>
  );
}

const CollectionTimeslider = (props) => {
  const classes = useCollectionTimesliderStyles();
  const [localRange, setLocalRange] = useState(props.collectionTimeslider);
  const [minMax, setMinMax] = useState(props.collectionTimesliderRange);

  useEffect(() => {
    setLocalRange(props.collectionTimesliderRange);
    // on component mount, check the URl to apply any necessary filters
    // first, check if url has a 'filters' parameter
    const match = matchPath(props.location.pathname, {
      path: "/catalog/:filters",
    });
    const filters = match ? match.params.filters : null;
    if (filters) {
      try {
        const allFilters = JSON.parse(decodeURIComponent(filters));
        // second, check if filters param includes range key
        if (Object.keys(allFilters).includes("range")) {
          // third, apply range and set state to reflect it
          setLocalRange(allFilters.range);
          props.setCollectionTimeslider(allFilters.range);
        }
      } catch (e) {
        console.log(e);
        if (window.location.pathname !== "/404") {
          props.url404();
        }
      }
    }
  }, []);

  const handleChangeTimeslider = (event, newValue) => {
    setLocalRange(newValue);
  };

  const handleCommitTimeslider = (event, newValue) => {
    props.setCollectionTimeslider(newValue);

    // update URL to reflect new timeslider changes
    const prevFilter = props.history.location.pathname.includes("/catalog/")
      ? JSON.parse(
          decodeURIComponent(
            props.history.location.pathname.replace("/catalog/", "")
          )
        )
      : {};
    const filterObj = { ...prevFilter, range: newValue };
    // if timeslider at full range, remove from the url completely
    if (
      filterObj["range"][0] === minMax[0] &&
      filterObj["range"][1] === minMax[1]
    ) {
      delete filterObj["range"];
    }
    const filterString = JSON.stringify(filterObj);
    // if empty filter settings, use the base home url instead of the filter url
    Object.keys(filterObj).length === 0
      ? props.setUrl("/")
      : props.setUrl("/catalog/" + encodeURIComponent(filterString));
    // log filter change in store
    Object.keys(filterObj).length === 0
      ? props.logFilterChange("/")
      : props.logFilterChange("/catalog/" + encodeURIComponent(filterString));
  };

  return (
    <div id="timeslider-component" className="timeslider-component">
      <Box textAlign="center">
        <Typography className="centered" variant="body2" component="div">
          {localRange[0]} - {localRange[1]}
        </Typography>  
      </Box>
      
      <ListItem>
        <Slider
          component="div"
          classes={classes}
          min={minMax[0]}
          max={minMax[1]}
          step={1}
          onChange={handleChangeTimeslider}
          onChangeCommitted={handleCommitTimeslider}
          valueLabelDisplay="auto"
          value={localRange}
          ThumbComponent={AirbnbThumbComponent}
        />
      </ListItem>
    </div>
  );
};

export default CollectionTimeslider;
