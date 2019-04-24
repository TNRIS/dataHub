import React, { Component } from 'react';
import { Redirect } from 'react-router';
import image404 from '../images/404.jpg';

class NotFound extends Component {
  componentDidMount() {
    if (this.props.view !== 'notFound') {
      this.props.setViewNotFound();
    }
  }

  componentDidUpdate() {
    if (this.props.view !== 'notFound') {
      this.props.setViewNotFound();
    }
  }

  render() {
    if (window.location.pathname !== '/404') {
      return <Redirect to='/404' />;
    }

    return (
      <div className="notfound-component">
          <div className="notfound">
            <img
              src={image404}
              alt="Lieutenant Commander Data"
              className="notfound-image"
              />
            <h2>ERROR 404: Not Found</h2>
            <p>
              The page you're looking for does not exist.
              <br />
              <a href="/" title="Reset the Holodeck">Reset the Holodeck</a>
            </p>
          </div>
      </div>
    )
  }
}

export default NotFound
