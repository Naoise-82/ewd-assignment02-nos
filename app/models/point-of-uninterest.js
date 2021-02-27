"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const pointsOfUninterestSchema = new Schema({
  name: String,
  category: String,
  description: String,
  analytics: String,
  /*creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },*/
});

module.exports = Mongoose.model("Point-Of-Unnterest", pointsOfUninterestSchema);