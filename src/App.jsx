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

import { ThemeProvider } from "@material-ui/core/styles";
import BasicTheme from './cssInJs/themes/_basic';

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

  render() {
    return (
      <ThemeProvider theme={BasicTheme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <ApiModalContainer />
            <CatalogContainer />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );
  }
}

export default App;
