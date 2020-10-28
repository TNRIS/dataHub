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

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({
  overrides: {
    root: {
      "&$checked": {
        color: "#1e8dc1",
      },
    },
    MuiListSubheader: {
      root: {
        lineHeight: "1rem",
      },
    },
    MuiListItem: {
      root: {
        cursor: "pointer",
        height: 40,
        '&:hover': {
          background: 'rgba(0,0,0,0.08)'
        },
        '&$selected, &$selected:hover': {
          color: '#1E8DC1'
        },
        textTransform: 'capitalize',
      },
    }
  },
  palette: {
    primary: {
      light: "#bbdefb",
      main: "#1E8DC1",
      dark: "#156287",
      contrastText: "#fff",
    },
    secondary: {
      light: "#bbdefb",
      main: "#1E8DC1",
      dark: "#156287",
      contrastText: "#fff",
    },
  },
});

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
      <ThemeProvider theme={theme}>
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
