'use strict';

const PointOfUninterest = require("../models/point-of-uninterest");
const user = require("../models/user");
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
        creator: user._id
      });
      await newPointOfUninterest.save();
      return h.redirect("/home");
    },
  },

  viewPOUI: {
    handler: async function (request, h) {
      try {
        const poui = await PointOfUninterest.findById(request.params._id);
        const user = await User.findById(poui.creator);
        console.log("Viewing POUI" + poui);
        return h.view("view-poui", { 
          title: "View POUI", 
          name: poui.name,
          category: poui.category,
          description: poui.description,
          creator: user.firstName + " " + user.lastName,
        });
      } catch (err) {
        return h.view("view-poui"), { errors: [{ message: err.message }] }
      }
    }
  },

  deletePOUI: {
    handler: async function (request, h) {
      try {
        const poui = await PointOfUninterest.findById(request.params._id);
        console.log("Removing POUI: " + poui);
        await poui.remove();
        return h.redirect("/report");
      } catch (err) {
        return h.view("report"), { errors: [{ message: err.message }] }
      }
    }
  },
};

module.exports = PointsOfUninterest;