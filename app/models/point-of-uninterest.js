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
    lat: Number,
    lng: Number,
});

module.exports = Mongoose.model("Point-Of-Uninterest", pointOfUninterestSchema);