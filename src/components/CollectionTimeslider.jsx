import React from 'react';
import { matchPath } from 'react-router-dom';
import Range from 'rc-slider/lib/Range';

import 'rc-slider/assets/index.css';

export default class CollectionTimeslider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      range: this.props.collectionTimeslider,
      setMin: this.props.collectionTimeslider[0],
      setMax: this.props.collectionTimeslider[1]
    }
    this.handleSetTimeslider = this.handleSetTimeslider.bind(this);
  }

  componentDidMount () {
    if (this.props.collectionTimesliderRange !== this.state.range) {
      this.setState({
        range: this.props.collectionTimesliderRange,
        setMin: this.props.collectionTimesliderRange[0],
        setMax: this.props.collectionTimesliderRange[1]
      });
    }
    // on component mount, check the URl to apply any necessary filters
    // first, check if url has a 'filters' parameter
    const match = matchPath(
        this.props.location.pathname,
        { path: '/catalog/:filters' }
      );
    const filters = match ? match.params.filters : null;
    if (filters) {
      try {
        const allFilters = JSON.parse(decodeURIComponent(filters));
        // second, check if filters param includes range key
        if (Object.keys(allFilters).includes('range')) {
          // third, apply range and set state to reflect it
          this.setState({
            setMin: allFilters.range[0],
            setMax: allFilters.range[1]
          });
          this.props.setCollectionTimeslider(allFilters.range);
        }
      } catch (e) {
        console.log(e);
        if (window.location.pathname !== '/404') { this.props.url404(); }
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.collectionTimeslider[0] !== this.props.collectionTimeslider[0] ||
       prevProps.collectionTimeslider[1] !== this.props.collectionTimeslider[1]) {
         this.setState({
           setMin: this.props.collectionTimeslider[0],
           setMax: this.props.collectionTimeslider[1]
         });
    }
  }

  handleSetTimeslider(target) {
    this.setState({
      setMin: target[0],
      setMax: target[1]
    });
    this.props.setCollectionTimeslider(target);

    // update URL to reflect new timeslider changes
    const prevFilter = this.props.history.location.pathname.includes('/catalog/') ?
                       JSON.parse(decodeURIComponent(this.props.history.location.pathname.replace('/catalog/', '')))
                       : {};
    const filterObj = {...prevFilter, range: target};
    // if timeslider at full range, remove from the url completely
    if (filterObj['range'][0] === this.state.range[0] && filterObj['range'][1] === this.state.range[1]) {
      delete filterObj['range'];
    }
    const filterString = JSON.stringify(filterObj);
    // if empty filter settings, use the base home url instead of the filter url
    Object.keys(filterObj).length === 0 ? this.props.setUrl('/') : this.props.setUrl('/catalog/' + encodeURIComponent(filterString));
    // log filter change in store
    Object.keys(filterObj).length === 0 ? this.props.logFilterChange('/') : this.props.logFilterChange('/catalog/' + encodeURIComponent(filterString));
}

  render() {
    return (
      <div className='timeslider-component'>
        <div className="mdc-typography--body2">{this.state.setMin} - {this.state.setMax}</div>
        <Range id="timeslider-rc-slider"
               min={this.state.range[0]}
               max={this.state.range[1]}
               value={[this.state.setMin, this.state.setMax]}
               pushable={true}
               onChange={this.handleSetTimeslider} />
      </div>
    );
  }
}
