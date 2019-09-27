import React from 'react';

export default class ScrollTop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showButton: 'no'
    }

    this.detectScroll = this.detectScroll.bind(this);
    this.scrollTop = this.scrollTop.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.detectScroll);
  }

  detectScroll() {
    window.pageYOffset >= 1000 ? this.setState({showButton: 'yes'}) : this.setState({showButton: 'no'});
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }

  render() {

    const buttonStyle = {
      position: 'right-bottom'
    }

    const scroll = this.state.showButton === 'yes' ? (
      <div className="scrolltop-component">
        <button style={buttonStyle} className="scrolltop mdc-fab" aria-label="Back to top" onClick={this.scrollTop}>
          <span className="mdc-fab__icon material-icons">keyboard_arrow_up</span>
        </button>
      </div>
    ) : '';

    return (
      {scroll}
    )
  }
}
