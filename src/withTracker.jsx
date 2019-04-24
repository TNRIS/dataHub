import { Component, } from "react";
import ReactGA from "react-ga";
// import { Route, Switch, BrowserRouter } from 'react-router-dom';
import createBrowserHistory from "history/createBrowserHistory";

ReactGA.initialize("UA-491601-16");

const history = createBrowserHistory({
  forceRefresh: true
});

// Get the current location
const location = history.location;

// Listen for changes to the current location.
history.listen((location, action) => {
  // location is an object like window.location
  console.log(location.pathname, location.state);
});

history.push(location)

console.log(location.pathname);
