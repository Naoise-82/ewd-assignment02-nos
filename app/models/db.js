"use strict";

const env = require('dotenv');
env.config();

const Mongoose = require("mongoose");

Mongoose.set("useNewUrlParser", true);
Mongoose.set("useUnifiedTopology", true);

Mongoose.connect(process.env.db);
const db = Mongoose.connection;

db.on("error", function(err) {
  console.log(`database connection error: ${err}`);
});

db.on("disconnected", function() {
  console.log("database disconnected");
});

db.once("open", function() {
  console.log(`database connected to ${this.name} on ${this.host}`);
});