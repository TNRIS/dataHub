import React from "react";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import { Typography } from "@material-ui/core";

export default class CatalogCard extends React.Component {
  constructor(props) {
    super(props);
    this.handleCardClick = this.handleCardClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleCardClick() {
    this.props.setViewCollection();
    this.props.selectCollection(this.props.collection.collection_id);
    this.props.setCollectionSearchQuery("");
    this.props.setCollectionSearchSuggestionsQuery("");
    this.props.setUrl("/collection/" + this.props.collection.collection_id);
  }

  handleKeyPress(e) {
    if (e.keyCode === 13 || e.keyCode === 32) {
      this.handleCardClick();
    }
  }

  render() {
    const collectionYear =
      this.props.collection.acquisition_date &&
      this.props.collection.template !== "outside-entity"
        ? this.props.collection.acquisition_date.substring(0, 4)
        : "";

    return (
      <Card
        className={"catalog-card-component"}      
        onClick={this.handleCardClick}
        onKeyDown={(e) => this.handleKeyPress(e)}
        tabIndex="2"
      >
        <CardMedia
          component="img"
          image={this.props.collection.thumbnail_image}
          title={this.props.collection.name + " thumbnail"}
          alt={this.props.collection.name + " thumbnail"}
        />
        <Typography variant="h6" component="p" className='catalog-card__headline'>
          {this.props.collection.name}
        </Typography>
        <Typography variant="subtitle1" component="p" className={'catalog-card__year'}>
          {collectionYear}
        </Typography>
        <Typography variant="subtitle1" component="p" className='catalog-card__source'>
          {this.props.collection.source_abbreviation}
        </Typography>
      </Card>
    );
  }
}
