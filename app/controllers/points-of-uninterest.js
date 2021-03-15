'use strict';

const PointOfUninterest = require("../models/point-of-uninterest");
const user = require("../models/user");
const { populate } = require("../models/user");
const User = require("../models/user");
const Joi = require('@hapi/joi');

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

  editPOUIPage: {
    handler: async function (request, h) {
      try {
        const poui = await PointOfUninterest.findById(request.params._id);
        return h.view("edit-poui", { title: "Edit POUI", poui: poui });
      } catch (err) {
        return h.view("login", { errors: [{ message: err.message }] });
      }
    },
  },

  editPOUI: {
    validate: {
      payload: {
        name: Joi.string().required(),
        category: Joi.string().required(),
        description: Joi.string().required(),
      },
      options: {
        abortEarly: false,
      },
      failAction: function (request, h, error) {
        return h
          .view("edit-poui", {
            title: "Update POUI error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      try {
        const pouiEdit = request.payload;
        const poui = await PointOfUninterest.findById(request.params_id);
        poui.name = pouiEdit.name;
        poui.category = pouiEdit.category;
        poui.description = pouiEdit.description;
        await poui.save();
        return h.redirect('/report');
      } catch (err) {
        return h.view("report", { errors: [{ message: error.message }] });
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