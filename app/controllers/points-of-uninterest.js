'use strict';

const PointOfUninterest = require("../models/point-of-uninterest");
const { populate } = require("../models/user");
const User = require("../models/user");

const PointsOfUninterest = {

  home: {
    handler: function (request, h) {
      return h.view("home", { title: "Create & Manage Points of Uninterest" });
    },
  },

  report: {
    handler: async function (request, h) {
      const pointsOfUninterest = await PointOfUninterest.find().populate("creator").lean();
      return h.view("report", {
        title: "POI's to Date",
        pointsOfUninterest: pointsOfUninterest,
      });
    },
  },

  createPOUI: {
    handler: async function (request, h) {
      const id = request.auth.credentials.id;
      const user = await User.findById(id);
      const data = request.payload;
      const newPointOfUninterest = new PointOfUninterest({
        name: data.name,
        category: data.category,
        description: data.description,
        analytics: data.analytics,
        firstName: user.firstName,
        creator: user._id
      });
      await newPointOfUninterest.save();
      return h.redirect("/home");
    },
  }
};

module.exports = PointsOfUninterest;