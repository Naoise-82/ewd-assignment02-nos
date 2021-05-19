"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const pointOfUninterestSchema = new Schema({
  name: String,
  category: String,
  description: String,
  imageURL: String,
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  location: {
    lat: Number,
    lng: Number
  },
  reviews: [
    {
      reviewer: String,
      comment: String
    }
  ],
  ratings: {
    raters: [String],
    thumbsUp: Number,
    thumbsDown: Number
  }
});

module.exports = Mongoose.model("Point-Of-Uninterest", pointOfUninterestSchema);