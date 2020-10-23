import React from "react";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import { Typography } from "@material-ui/core";

const CatalogCard = (props) => {
  const handleCardClick = () => {
    props.setViewCollection();
    props.selectCollection(props.collection.collection_id);
    props.setCollectionSearchQuery("");
    props.setCollectionSearchSuggestionsQuery("");
    props.setUrl("/collection/" + props.collection.collection_id);
  };

  const handleKeyPress = (e) => {
    if (e.keyCode === 13 || e.keyCode === 32) {
      handleCardClick();
    }
  };

  const collectionYear =
    props.collection.acquisition_date &&
    props.collection.template !== "outside-entity"
      ? props.collection.acquisition_date.substring(0, 4)
      : "";

  return (
    <Card
      className={"catalog-card-component"}
      onClick={ () => handleCardClick() }
      onKeyDown={(e) => handleKeyPress(e)}
      tabIndex="2"
    >
      <CardMedia
        component="img"
        image={props.collection.thumbnail_image}
        title={props.collection.name + " thumbnail"}
        alt={props.collection.name + " thumbnail"}
      />
      <Typography variant="h6" component="p" className="catalog-card__headline">
        {props.collection.name}
      </Typography>
      <Typography
        variant="subtitle1"
        component="p"
        className={"catalog-card__year"}
      >
        {collectionYear}
      </Typography>
      <Typography
        variant="subtitle1"
        component="p"
        className="catalog-card__source"
      >
        {props.collection.source_abbreviation}
      </Typography>
    </Card>
  );
};

export default CatalogCard
