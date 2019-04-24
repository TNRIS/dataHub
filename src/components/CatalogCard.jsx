import React from 'react';

export default class CatalogCard extends React.Component {
  constructor(props) {
    super(props)
    this.handleCardClick = this.handleCardClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleCardClick() {
    this.props.setViewCollection();
    this.props.selectCollection(this.props.collection.collection_id);
    this.props.setCollectionSearchQuery('');
    this.props.setCollectionSearchSuggestionsQuery('');
    this.props.setUrl('/collection/' + this.props.collection.collection_id);
  }

  handleKeyPress (e) {
    if (e.keyCode === 13 || e.keyCode === 32) {
      this.handleCardClick();
    }
  }

  render() {
    const collectionYear = this.props.collection.acquisition_date &&
      this.props.collection.template !== 'outside-entity' ?
      this.props.collection.acquisition_date.substring(0, 4) : '';

    return (
      <div
        className="catalog-card-component mdc-card"
        onClick={this.handleCardClick}
        onKeyDown={(e) => this.handleKeyPress(e)}
        tabIndex="2">
        <div
          className="mdc-card__media mdc-card__media--16-9"
          style={{backgroundImage: `url(${this.props.collection.thumbnail_image})`}}>
        </div>
        <p className='catalog-card__headline mdc-typography--headline6'>
          {this.props.collection.name}
        </p>
        <p className='catalog-card__year mdc-typography--subtitle1'>
          {collectionYear}
        </p>
        <p className='catalog-card__source mdc-typography--subtitle1'>
          {this.props.collection.source_abbreviation}
        </p>
      </div>
    );
  }
}
