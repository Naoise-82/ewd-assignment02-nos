'use strict';

const PointOfUninterest = require("../models/point-of-uninterest");
const user = require("../models/user");
const { populate } = require("../models/user");
const User = require("../models/user");
const Joi = require('@hapi/joi');
const { notImplemented } = require("@hapi/boom");
const { isValidObjectId } = require("mongoose");
const { func } = require("@hapi/joi");

const PointsOfUninterest = {

  createPOUIPage: {
    handler: function (_request, h) {
      return h.view("create-poui-page", { title: "Create A Point of Uninterest" });
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

        var pouiCoords = [];
        var pouiNames = [];
        var pouiIds = [];

        var i;
        for (i = 0; i < pointsOfUninterest.length; i++) {
          var latLng = [pointsOfUninterest[i].location.lat, pointsOfUninterest[i].location.lng];
          var pouiName = pointsOfUninterest[i].name;
          var pouiId = pointsOfUninterest[i]._id;
          pouiNames.push(pouiName);
          pouiCoords.push(latLng);
          pouiIds.push(pouiId);

        }

        // convert the coordinates into a string usable by handlebars fr setting the bounds of the map
        var coordArrayString = JSON.stringify(pouiCoords);

        // split the lat and lng coordinates into two arrays for recombining into markers at the front-end script
        var latArray = [];
        var lngArray = [];

        for (i = 0; i < pointsOfUninterest.length; i++) {
          var lat = pointsOfUninterest[i].location.lat;
          latArray.push(lat);
          var lng = pointsOfUninterest[i].location.lng;
          lngArray.push(lng);
        }

        // convert the arrays to literal strings containing [] brackets
        var latArrayString = JSON.stringify(latArray);
        var lngArrayString = JSON.stringify(lngArray);


        return h.view("view-all-poui", {
          title: "All POI's to Date",
          pointsOfUninterest: pointsOfUninterest,
          coordArrayString: coordArrayString,
          pouiNames: pouiNames,
          pouiIds: pouiIds,
          latArrayString: latArrayString,
          lngArrayString: lngArrayString
        });
      } catch (err) {
        return h.view("home"), { errors: [{ message: err.message }] }
      }
    }
  },

  searchPOUI: {
    validate: {
      payload: {
        searchTerm: Joi.string().required()
      },
      options: {
        abortEarly: false,
      },
      failAction: function (request, h, error) {
        return h
          .view("view-all-poui", {
            title: "Search error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      try {
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        const data = request.payload;
        var pointsOfUninterest = await PointOfUninterest.find().populate("creator").lean();

        // allow for searching with or without category or keywords defined
        if (data.category === undefined && data.searchTerm === undefined) {
          pointsOfUninterest = await PointOfUninterest.find().populate("creator").lean();
        } else if (data.category === undefined) {
          pointsOfUninterest = await PointOfUninterest.find({ $or: [{ name: { "$regex": new RegExp(data.searchTerm, "i") } }, { description: { "$regex": new RegExp(data.searchTerm, "i") } }] }).populate("creator").lean();
        } else if (data.searchTerm === undefined) {
          pointsOfUninterest = await PointOfUninterest.find({ category: data.category }).populate("creator").lean();
        } else {
          pointsOfUninterest = await PointOfUninterest.find({ $and: [{ $or: [{ name: { "$regex": new RegExp(data.searchTerm, "i") } }, { description: { "$regex": new RegExp(data.searchTerm, "i") } }] }, { category: data.category }] }).populate("creator").lean();
        };

        // the same code as for viewAllPOUI() above reused after the serch has refined the POUI list
        var pouiCoords = [];
        var pouiNames = [];

        var i;
        for (i = 0; i < pointsOfUninterest.length; i++) {
          var latLng = [pointsOfUninterest[i].location.lat, pointsOfUninterest[i].location.lng];
          var pouiName = pointsOfUninterest[i].name;
          pouiNames.push(pouiName);
          pouiCoords.push(latLng);

        }

        var coordArrayString = JSON.stringify(pouiCoords);

        // split the lat anf lng coordinated into two arrays for recombining into markers on the map
        var latArray = [];
        var lngArray = [];

        for (i = 0; i < pointsOfUninterest.length; i++) {
          var lat = pointsOfUninterest[i].location.lat;
          latArray.push(lat);
          var lng = pointsOfUninterest[i].location.lng;
          lngArray.push(lng);
        }

        // convert the arrays to literal strings
        var latArrayString = JSON.stringify(latArray);
        var lngArrayString = JSON.stringify(lngArray);

        return h.view("view-all-poui", {
          title: "All POUI's to Date",
          pointsOfUninterest: pointsOfUninterest,
          coordArrayString: coordArrayString,
          pouiNames: pouiNames,
          latArrayString: latArrayString,
          lngArrayString: lngArrayString
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
        location: {
          lat: data.lat,
          lng: data.lng,
        },
        description: data.description,
        creator: user._id,
        ratings: {
          raters: [],
          thumbsUp: 0,
          thumbsDown: 0
        },
        reviews: []
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
        if (poui.ratings.thumbsDown === 0 && poui.ratings.thumbsUp === 0) {
          var percentagePositive = 0;
        } else {
          percentagePositive = Math.round(poui.ratings.thumbsUp / (poui.ratings.thumbsUp + poui.ratings.thumbsDown) * 100);
        }
        console.log("Viewing POUI " + poui);
        return h.view("view-poui", {
          title: "View POUI",
          name: poui.name,
          id: poui._id,
          category: poui.category,
          description: poui.description,
          lat: poui.location.lat,
          lng: poui.location.lng,
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
    validate: {
      payload: {
        comment: Joi.string().required(),
      },
      options: {
        abortEarly: false,
      },
      failAction: function (request, h, error) {
        return h
          .view("signup", {
            title: "Settings Update error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
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

        //check if the current user has already voted on this POUI before, and ignore the vote if they have
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

        //check if the current user has already voted on this POUI before, and ignore the vote if they have
        if (poui.ratings.raters.includes(userName)) {
          console.log("Already Voted");
          return h.redirect("/view-poui/" + id);
        } else {
          poui.ratings.raters.push(userName);
          poui.ratings.thumbsDown = poui.ratings.thumbsDown + 1;

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
          description: poui.description,
          lat: poui.location.lat,
          lng: poui.location.lng
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
        lat: Joi.number().required(),
        lng: Joi.number().required()
      },
      options: {
        abortEarly: false,
      },
      failAction: function (_request, h, error) {
        return h
          .view("view-poui/" + poui._id, {
            title: "Edit POUI error",
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
        poui.location.lat = pouiEdit.lat;
        poui.location.lng = pouiEdit.lng;
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