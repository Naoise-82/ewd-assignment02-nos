"use strict";

const PointOfUninterest = require("../models/point-of-uninterest");
const User = require('../models/user');
const Boom = require("@hapi/boom");

const PointsOfUninterest = {

    findAll: {
        auth: false,
        handler: async function (request, h) {
            const pointsOfUninterest = await PointOfUninterest.find();
            return pointsOfUninterest;
        }
    },

    findByCreator: {
        auth: false,
        handler: async function (request, h) {
            const pouis = await PointOfUninterest.find({ creator: request.params.id });
            return pouis;
        },
    },

    createPOUI: {
        auth: false,
        handler: async function (request, h) {
            let poui = new PointOfUninterest(request.payload);
            const user = await User.findOne({ _id: request.params.id });
            if (!user) {
                return Boom.notFound("No User with this id");
            }
            poui.creator = user._id;
            poui = await poui.save();
            return poui;
        },
    },
    

    voteOnPOUI: {
        auth: false,
        handler: async function (request, h) {
            let poui = PointOfUninterest.findOne( {id: request.payload.pouiId });
            console.log(poui);
            const user = await User.findOne({ id: request.params.id });
            console.log(user);
            const voteValue = request.payload.voteValue;
            if (!user) {
                return Boom.notFound("No User with this id");
            }

            if (poui.ratings.raters.includes(user.firstName + user.lastName)) {
                return Boom.preconditionFailed("User already voted on this POUI");
            }
            await poui.ratings.raters.push(user.firstName + " " + user.lastName)
            console.log(poui);

            if (voteValue == "thumbsUp") {
                poui.ratings.thumbsUp = poui.ratings.thumbsUp + 1;
                console.log("ThumbsUp: " + poui.ratings.thumbsUp)
            } else if (voteValue == "thumbsDown") {
                poui.ratings.thumbsDown = poui.ratings.thumbsDown + 1;
            }

            poui = await poui.save();
            return poui;
        },
    },

    reviewPOUI: {
        auth: false,
        handler: async function (request, h) {
            let poui = PointOfUninterest.findById(request.payload.pouiId);
            console.log(poui);
            const user = await User.findById(request.payload.userId);
            console.log(user);
            const comment = request.payload.comment;
            if (!user) {
                return Boom.notFound("No User with this id");
            }
            const review = {
                reviewer: user.firstName + " " + user.lastName,
                comment: comment
            }
            console.log(review);
            poui = await poui.reviews.push(review);
            poui = await poui.save();


        }
            
    },

    deleteOne: {
        auth: false,
        handler: async function (request, h) {
            const poui = await PointOfUninterest.deleteOne({ id: request.payload });
            if (poui) {
                return { success: true };
            }
            return Boom.notFound("No POUI with this id");
        },
    },

    deleteAll: {
        auth: false,
        handler: async function (request, h) {
            await PointOfUninterest.deleteMany({});
            return { success: true };
        },
    },

}
module.exports = PointsOfUninterest;