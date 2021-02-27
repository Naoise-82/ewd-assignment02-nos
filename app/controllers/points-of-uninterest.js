'use strict';

const PointOfUninterest = require("../models/point-of-uninterest");
const { populate } = require("../models/user");
const User = require("../models/user");

const PointsOfInterest = {

  home: {
    handler: function (request, h) {
      return h.view("home", { title: "Create & Manage Points of Uninterest" });
    },
  },

  report: {
    handler: async function (request, h) {
      const donations = await PointsOfInterest.find().populate("creator").lean();
      return h.view("report", {
        title: "POI's to Date",
        donations: donations,
      });
    },
  },

  donate: {
    handler: async function (request, h) {
      const id = request.auth.credentials.id;
      const user = await User.findById(id);
      const data = request.payload;
      const newPintOfInterest = new PointsOfInterest({
        amount: data.amount,
        method: data.method,
        firstName: user.firstName,
        donor: user._id
      });
      await newPintOfInterest.save();
      return h.redirect("/report");
    },
  }
};

module.exports = PointsOfInterest;