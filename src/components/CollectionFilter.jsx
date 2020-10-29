import React, {useEffect} from "react";
import { matchPath } from "react-router-dom";
import turfBbox from "@turf/bbox";
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Collapse,
  Icon,
} from "@material-ui/core";
// the carto core api is a CDN in the app template HTML (not available as NPM package)
// so we create a constant to represent it so it's available to the component
const cartodb = window.cartodb;

const CollectionFilter = (props) => {
  useEffect(() => {
    // on component mount, check the URl to apply any necessary filters
    // first, check if url has a 'filters' parameter
    const match = matchPath(props.location.pathname, {
      path: "/catalog/:filters",
    });
    const filters = match ? match.params.filters : null;
    if (filters) {
      try {
        const allFilters = JSON.parse(decodeURIComponent(filters));
        // second, check if filters param includes filters key
        if (Object.keys(allFilters).includes("filters")) {
          // third, apply all filters and check those associated checkboxes
          props.setCollectionFilter(allFilters.filters);
        }
        // fourth, apply geo to store and component if present
        if (Object.keys(allFilters).includes("geo")) {
          // check if the filter is a user defined polygon or
          // if it is a geocoder feature filter
          if (allFilters.geo.hasOwnProperty("coordinates")) {
            handleSetGeoFilter(this, "draw", allFilters.geo);
          } else if (allFilters.geo.hasOwnProperty("osm")) {
            // clear the GeoSearcher input value and call the
            // fetchFeatures method to set the filter
            props.setGeoSearcherInputValue(allFilters.geo.osm);
            fetchFeatures(allFilters.geo.osm);
          }
        }
      } catch (e) {
        console.log(e);
        if (window.location.pathname !== "/404") {
          props.url404();
        }
      }
    }
  }, []);

  // fetch features from the geocoder api
  const fetchFeatures = (feature) => {
    const geocodeUrl = `https://nominatim.tnris.org/search/\
      ${feature}?format=geojson&polygon_geojson=1`;
    // ajax request to retrieve the features
    fetch(geocodeUrl)
      .then((response) => response.json())
      .then((json) => {
        // response returns an array and we want the first item
        handleSetGeoFilter(this, "osm", json.features[0]);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSetGeoFilter = (_this, aoiType, aoi) => {
    // get the bounds from the aoi and query carto
    // to find the area_type polygons that intersect this mbr
    // and return the collection_ids associated with those areas
    let bounds = turfBbox(aoi); // get the bounds with turf.js
    let sql = new cartodb.SQL({ user: "tnris-flood" });
    let query = `SELECT
                   areas_view.collections
                 FROM
                   area_type, areas_view
                 WHERE
                   area_type.area_type_id = areas_view.area_type_id
                 AND
                   area_type.the_geom && ST_MakeEnvelope(
                     ${bounds[2]}, ${bounds[1]}, ${bounds[0]}, ${bounds[3]})`;

    sql
      .execute(query)
      .done(function (data) {
        // set up the array of collection_id arrays from the returned
        // query object
        let collectionIds = data.rows.map(function (obj) {
          return obj.collections.split(",");
        });
        // combine all collection_id arrays into a single array of unique ids
        let uniqueCollectionIds = [...new Set([].concat(...collectionIds))];
        props.setCollectionFilterMapFilter(uniqueCollectionIds);
        props.setCollectionFilterMapAoi({
          aoiType: aoiType,
          payload: aoi,
        });
      })
      .error(function (errors) {
        // errors contains a list of errors
        console.log("errors:" + errors);
      });
  };

  const toggleFilterMenu = (e, filterName) => {
    let filterListElement = document.getElementById(`${filterName}-list`);
    let filterListTitleIcon = document.getElementById(
      `${filterName}-expansion-icon`
    );

    if (filterListElement.classList.contains("MuiCollapse-hidden")) {
      filterListElement.classList.remove("MuiCollapse-hidden");
      filterListElement.classList.add("MuiCollapse-entered");
      filterListTitleIcon.innerHTML = "expand_less";
    } else {
      filterListElement.classList.remove("MuiCollapse-entered");
      filterListElement.classList.add("MuiCollapse-hidden");
      filterListTitleIcon.innerHTML = "expand_more";
    }
  };

  const toggleFilter = (choice, choiceValue) => {
    let currentFilters = { ...props.collectionFilter };

    //If filters contains parent key, check if child exists and add or remove it (toggle it). Else, add parent and child
    if (currentFilters.hasOwnProperty(choice)) {
      const filterIndex = currentFilters[choice].indexOf(choiceValue);
      //get index of child value in filter, return -1 if does not exist

      if (filterIndex < 0) {
        currentFilters[choice].push(choiceValue);
      } else {
        currentFilters[choice].splice(filterIndex, 1);
      }

      if (currentFilters[choice].length < 1) {
        delete currentFilters[choice];
      }

      props.setCollectionFilter(currentFilters);
    } else {
      currentFilters = { ...currentFilters, [choice]: [choiceValue] };
      //Use ES6 syntax to add dynamic key in brackets, assigning its value

      props.setCollectionFilter(currentFilters);
    }

    // update URL to reflect new filter changes
    const prevFilter = props.history.location.pathname.includes("/catalog/")
      ? JSON.parse(
          decodeURIComponent(
            props.history.location.pathname.replace("/catalog/", "")
          )
        )
      : {};
    const filterObj = { ...prevFilter, filters: currentFilters };
    // if all filters turned off, remove from the url completely
    if (Object.keys(filterObj["filters"]).length === 0) {
      delete filterObj["filters"];
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

  const handleKeyPress = (e) => {
    if (e.keyCode === 13 || e.keyCode === 32) {
      if (e.target.id !== "filter-map-button") {
        toggleFilterMenu(e);
      } else {
        showGeoFilter();
      }
    }
  };

  const handleKeySetFilter = (e) => {
    if (e.keyCode === 13 || e.keyCode === 32) {
      e.target.checked = !e.target.checked;
      toggleFilter(e.target);
    }
  };

  const showGeoFilter = () => {
    props.setViewGeoFilter();
    props.setUrl("/geofilter/");
  };

  return (
    <div id="filter-component" className="filter-component">
      <List
        id="filter-list"
        component="nav"
        aria-label="Filter list"
        subheader={
          <ListSubheader
            disableSticky={true}
            component="div"
            id="nested-list-subheader"
          >
            Filter
          </ListSubheader>
        }
      >
        {Object.keys(props.collectionFilterChoices).map((choice) => (
          <List component="nav" id={`filter-by-${choice}`} key={choice}>
            <ListItem
              selected={
                Object.keys(props.collectionFilter).includes(choice)
                  ? true
                  : false
              }
              id={`${choice}-title`}
              onClick={(e) => toggleFilterMenu(e, choice)}
              onKeyDown={(e) => handleKeyPress(e)}
              tabIndex="0"
            >
              <ListItemText primary={`by ${choice.replace(/_/, " ")}`} />
              <Icon id={`${choice}-expansion-icon`}>expand_more</Icon>
            </ListItem>
            <Collapse in={false} id={`${choice}-list`}>
              <List>
                {props.collectionFilterChoices[choice].map((choiceValue, i) => {
                  const labelValue = choiceValue.replace(/_/g, " ");
                  const choiceIsSelected = props.collectionFilter.hasOwnProperty(
                    choice
                  )
                    ? true
                    : false;
                  const choiceValueIsSelected = choiceIsSelected
                    ? props.collectionFilter[choice].includes(choiceValue)
                    : false;

                  return (
                    <ListItem
                      key={choiceValue}
                      onClick={(e) => toggleFilter(choice, choiceValue)}
                      onKeyDown={(e) => handleKeySetFilter(e)}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={choiceValueIsSelected}
                          edge="start"
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ "aria-labelledby": choice }}
                          id={choiceValue}
                        />
                      </ListItemIcon>
                      <ListItemText
                        id={`${choiceValue}-label`}
                        primary={labelValue}
                        htmlFor={labelValue}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </List>
        ))}
        <List>
          <ListItem
            key="filter-map-button"
            selected={props.collectionFilterMapFilter.length > 0}
            id="filter-map-button"
            onClick={() => showGeoFilter()}
            onKeyDown={(e) => handleKeyPress(e)}
            tabIndex="0"
          >
            <ListItemText primary={"by geography"} />
          </ListItem>
        </List>
      </List>
    </div>
  );
};

export default CollectionFilter