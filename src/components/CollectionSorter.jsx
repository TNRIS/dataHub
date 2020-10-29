import React, { useEffect } from "react";
import { matchPath } from "react-router-dom";

import { List, ListItem, ListItemText, ListSubheader } from "@material-ui/core";

const CollectionSorter = (props) => {

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
        // second, check if filters param includes sort key
        if (Object.keys(allFilters).includes("sort")) {
          // third, apply sort to store and component
          if (props.sortOrder !== allFilters.sort) {
            setSort(allFilters.sort);
          }
        }
      } catch (e) {
        console.log(e);
        if (window.location.pathname !== "/404") {
          props.url404();
        }
      }
    }
  }, [])

  const setSort = (order) => {
    if (props.sortOrder !== order) {
      switch (order) {
        case "NEW":
          props.sortNew();
          break;
        case "OLD":
          props.sortOld();
          break;
        case "AZ":
          props.sortAZ();
          break;
        case "ZA":
          props.sortZA();
          break;
        default:
          props.sortNew();
      }
      // update URL to reflect new sort change
      const prevFilter = props.history.location.pathname.includes(
        "/catalog/"
      )
        ? JSON.parse(
            decodeURIComponent(
              props.history.location.pathname.replace("/catalog/", "")
            )
          )
        : {};
      const filterObj = { ...prevFilter, sort: order };
      // if the default sort 'NEW' then remove from the url
      if (filterObj["sort"] === "NEW") {
        delete filterObj["sort"];
      }
      const filterString = JSON.stringify(filterObj);
      // if empty filter settings, use the base home url instead of the filter url
      Object.keys(filterObj).length === 0
        ? props.setUrl("/")
        : props.setUrl("/catalog/" + encodeURIComponent(filterString));
      // log filter change in store
      Object.keys(filterObj).length === 0
        ? props.logFilterChange("/")
        : props.logFilterChange(
            "/catalog/" + encodeURIComponent(filterString)
          );
    }
  }

  const handleKeyPress = (e, order) => {
    if (e.keyCode === 13 || e.keyCode === 32) {
      setSort(order);
    }
  }


    return (
      <div className="sort-component">
        <List id="sorter-list" component="nav" aria-label="Sort list"
          subheader={
            <ListSubheader disableSticky={true} component="div" id="nested-list-subheader">
              Sort
            </ListSubheader>
          }
        >
          <ListItem
            id="sorter-list-opt1"
            selected={props.sortOrder === "NEW" ? true : false}
            aria-selected={props.sortOrder === "NEW" ? "true" : "false"}
            tabIndex="0"
            onClick={() => setSort("NEW")}
            onKeyDown={(e) => handleKeyPress(e, "NEW")}
          >
            <ListItemText primary="Newest" />
          </ListItem>
          <ListItem
            id="sorter-list-opt2"
            selected={props.sortOrder === "OLD" ? true : false}
            aria-selected={props.sortOrder === "OLD" ? "true" : "false"}
            tabIndex="0"
            onClick={() => setSort("OLD")}
            onKeyDown={(e) => handleKeyPress(e, "OLD")}
          >
            <ListItemText primary="Oldest" />
          </ListItem>
          <ListItem
            id="sorter-list-opt3"
            selected={props.sortOrder === "AZ" ? true : false}
            aria-selected={props.sortOrder === "AZ" ? "true" : "false"}
            tabIndex="0"
            onClick={() => setSort("AZ")}
            onKeyDown={(e) => handleKeyPress(e, "AZ")}
          >
            <ListItemText primary="A to Z" />
          </ListItem>
          <ListItem
            id="sorter-list-opt4"
            selected={props.sortOrder === "ZA" ? true : false}
            aria-selected={props.sortOrder === "ZA" ? "true" : "false"}
            tabIndex="0"
            onClick={() => setSort("ZA")}
            onKeyDown={(e) => handleKeyPress(e, "ZA")}
          >
            <ListItemText primary="Z to A" />
          </ListItem>
        </List>
      </div>
    );
  
}

export default CollectionSorter;
