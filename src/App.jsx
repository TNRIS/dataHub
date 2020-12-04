import React, { Component } from "react";
import { createBrowserHistory } from "history";
import { routerMiddleware, ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";
import { createStore, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import ReactGA from "react-ga";

import rootReducer from "./reducers/rootReducer";
import CatalogContainer from "./containers/CatalogContainer";

import ApiModalContainer from "./containers/ApiModalContainer";


export const history = createBrowserHistory();
export const store = createStore(
  rootReducer(history),
  compose(applyMiddleware(thunk, routerMiddleware(history)))
);

class App extends Component {
  constructor() {
    super();
    ReactGA.initialize("UA-491601-16");
    ReactGA.pageview(window.location.pathname);
  }

  componentDidMount() {
    caches.delete("workbox-precache-v2-https://data.tnris.org/").then(function(boolean) {
      // your cache is now deleted
      console.log("workbox-precache-v2-https://data.tnris.org/ was deleted")
    });
  }

  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <ApiModalContainer />
          <CatalogContainer />
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default App;
