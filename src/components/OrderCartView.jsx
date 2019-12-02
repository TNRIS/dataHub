import React from 'react'
import OrderCartContainer from '../containers/OrderCartContainer'
import BackButtonContainer from '../containers/BackButtonContainer'

class OrderCartView extends React.Component {

  componentDidMount() {
    window.scrollTo(0,0);
  }

  render() {
    return (
      <div className="order-cart-view">
        <div className="mdc-top-app-bar__row">
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <span className="mdc-top-app-bar__title">
              Shopping Cart
            </span>
          </section>
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end">
            <BackButtonContainer />
          </section>
        </div>
        <OrderCartContainer />
      </div>
    );
  }
}

export default OrderCartView;
