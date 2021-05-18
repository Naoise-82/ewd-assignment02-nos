'use strict';

const PointOfUninterest = require("../models/point-of-uninterest");
const user = require("../models/user");
const { populate } = require("../models/user");
const User = require("../models/user");
const Joi = require('@hapi/joi');
const { notImplemented } = require("@hapi/boom");
const { isValidObjectId } = require("mongoose");

const PointsOfUninterest = {

  home: {
    handler: function (request, h) {
      return h.view("home", { title: "Create & Manage Points of Uninterest" });
    },
  },

  report: {
    handler: async function (request, h) {
      try {
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        const pointsOfUninterest = await PointOfUninterest.find({ creator: id }).populate("creator").lean();
        return h.view("report", {
          title: "Your POI's to Date",
          pointsOfUninterest: pointsOfUninterest,
          name: user.firstName,
        });
      } catch (err) {
        return h.view("report"), { errors: [{ message: err.message }] }
      }
    }
  },

  viewAllPOUI: {
    handler: async function (request, h) {
      try {
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        const pointsOfUninterest = await PointOfUninterest.find().populate("creator").lean();
        return h.view("view-all-poui", {
          title: "All POI's to Date",
          pointsOfUninterest: pointsOfUninterest,
        });
      } catch (err) {
        return h.view("home"), { errors: [{ message: err.message }] }
      }
    }
  },

  searchPOUI: {
    handler: async function (request, h) {
      try {
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        const data = request.payload;
        var pointsOfUninterest = await PointOfUninterest.find().populate("creator").lean();

        if (data.category === undefined && data.searchTerm === undefined) {
          pointsOfUninterest = await PointOfUninterest.find().populate("creator").lean();
        } else if (data.category === undefined) {
          pointsOfUninterest = await PointOfUninterest.find({ $or: [{ name: { "$regex": new RegExp(data.searchTerm, "i") } }, { description: { "$regex": new RegExp(data.searchTerm, "i") } }] }).populate("creator").lean();
        } else if (data.searchTerm === undefined) {
          pointsOfUninterest = await PointOfUninterest.find({ category: data.category }).populate("creator").lean();
        } else {
          pointsOfUninterest = await PointOfUninterest.find({ $and: [{ $or: [{ name: { "$regex": new RegExp(data.searchTerm, "i") } }, { description: { "$regex": new RegExp(data.searchTerm, "i") } }] }, { category: data.category }] }).populate("creator").lean();
        };

        return h.view("view-all-poui", {
          title: "All POUI's to Date",
          pointsOfUninterest: pointsOfUninterest
        });
      } catch (err) {
        return h.view("view-all-pouis"), { errors: [{ message: err.message }] }
      }
    }
  },

  createPOUI: {
    handler: async function (request, h) {
      const id = request.auth.credentials.id;
      const user = await User.findById(id);
      const data = request.payload;
      const newPointOfUninterest = new PointOfUninterest({
        name: data.name,
        category: data.category,
        lat: data.lat,
        lng: data.lng,
        description: data.description,
        creator: user._id
      });
      await newPointOfUninterest.save();
      console.log(newPointOfUninterest);
      return h.redirect("/view-poui/" + newPointOfUninterest.id);
    },
  },

  viewPOUI: {
    handler: async function (request, h) {
      try {
        const poui = await PointOfUninterest.findById(request.params._id).lean();
        const creator = await User.findById(poui.creator);
        const percentagePositive = Math.round(poui.ratings.thumbsUp / (poui.ratings.thumbsUp + poui.ratings.thumbsDown) * 100);
        console.log("Viewing POUI " + poui);
        return h.view("view-poui", {
          title: "View POUI",
          name: poui.name,
          id: poui._id,
          category: poui.category,
          description: poui.description,
          lat: poui.lat,
          lng: poui.lng,
          imageURL: poui.imageURL,
          creator: creator.firstName + " " + creator.lastName,
          thumbsUp: poui.ratings.thumbsUp,
          thumbsDown: poui.ratings.thumbsDown,
          percentagePositive: percentagePositive,
          reviews: poui.reviews
        });
      } catch (err) {
        return h.view("view-poui"), { errors: [{ message: err.message }] }
      }
    }
  },

  // Adds a review to the list of reviews on the view POUI page
  submitReview: {
    handler: async function (request, h) {
      try {
        const poui = await PointOfUninterest.findById(request.params._id);
        console.log("POUI: " + poui.name);
        const id = poui._id;
        const data = request.payload;
        const userId = request.auth.credentials.id;
        const reviewer = await User.findById(userId);
        const comment = data.comment;

        const review = {
          "reviewer": reviewer.firstName + " " + reviewer.lastName,
          "comment": comment
        };

        console.log(review);
        poui.reviews.unshift(review);
        console.log(poui);
        await poui.save();
        return h.redirect("/view-poui/" + id);

      } catch (err) {
        return h.view("view-poui", { errors: [{ message: err.message }] });
      }
    },
  },

  // Adds a thumbs-up to the poui
  upVote: {
    handler: async function (request, h) {
      try {
        const poui = await PointOfUninterest.findById(request.params._id);
        console.log("POUI: " + poui.name);
        const id = poui._id;
        const userId = request.auth.credentials.id;
        const currentUser = await User.findById(userId).lean();
        const userName = currentUser.firstName + " " + currentUser.lastName;
        console.log(userName);

        if (poui.ratings.raters.includes(userName)) {
          console.log("Already Voted");
          return h.redirect("/view-poui/" + id);
        } else {
        poui.ratings.raters.push(userName);
        poui.ratings.thumbsUp = poui.ratings.thumbsUp + 1;

        console.log(poui);
        await poui.save();
        return h.redirect("/view-poui/" + id);
        };

      } catch (err) {
        return h.view("view-poui", { errors: [{ message: err.message }] });
      }
    }
  },

  // Adds a thumbs-down to the poui
  downVote: {
    handler: async function (request, h) {
      try {
        const poui = await PointOfUninterest.findById(request.params._id);
        console.log("POUI: " + poui.name);
        const id = poui._id;
        const userId = request.auth.credentials.id;
        const currentUser = await User.findById(userId).lean();
        const userName = currentUser.firstName + " " + currentUser.lastName
        console.log(userName);

        if (poui.ratings.raters.includes(userName)) {
          console.log("Already Voted");
          return h.redirect("/view-poui/" + id);
        } else {
          poui.ratings.raters.push(userName);
          poui.ratings.thumbsUp = poui.ratings.thumbsUp + 1;

          console.log(poui);
          await poui.save();
          return h.redirect("/view-poui/" + id);
        };

      } catch (err) {
        return h.view("view-poui", { errors: [{ message: err.message }] });
      }
    }
  },

  editPOUIPage: {
    handler: async function (request, h) {
      try {
        const poui = await PointOfUninterest.findById(request.params._id);
        return h.view("edit-poui", {
          title: "Edit POUI",
          id: poui._id,
          name: poui.name,
          category: poui.category,
          description: poui.description
        });
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
          .view("view-poui/" + poui._id, {
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
        const poui = await PointOfUninterest.findById(request.params._id);
        poui.name = pouiEdit.name;
        poui.category = pouiEdit.category;
        poui.description = pouiEdit.description;
        console.log("POUI Name: " + poui.name);
        await poui.save();
        return h.redirect('/view-poui/' + poui.id);
      } catch (err) {
        return h.view("edit-poui/" + poui.id, { errors: [{ message: error.message }] });
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