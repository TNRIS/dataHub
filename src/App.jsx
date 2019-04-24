import React, { Component } from 'react';
import { createBrowserHistory } from 'history';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import ReactGA from 'react-ga';

import rootReducer from './reducers/rootReducer';
import CatalogContainer from './containers/CatalogContainer';

export const history = createBrowserHistory();
export const store = createStore(rootReducer(history), compose(applyMiddleware(thunk, routerMiddleware(history))));

class App extends Component {
  constructor() {
    super();
    ReactGA.initialize("UA-491601-16");
    ReactGA.pageview(window.location.pathname);
  }

  render() {

    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <CatalogContainer />
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default App;
