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
            let poui = new PointOfUninterest(request.payload.poui);
            const voter = await User.findOne({ _id: request.params.id });
            const voteValue = request.payload.voteValue;
            if (!voter) {
                return Boom.notFound("No User with this id");
            }

            if (poui.ratings.raters.includes(voter.firstName + voter.lastName)) {
                return Boom.preconditionFailed("User already voted on this POUI");
            }
            if (voteValue === "thumbsUp") {
                poui.ratings.thumbsUp += 1;
            } else {
                poui.ratings.thumbsDown -= 1;
            }

            poui = await poui.save();
            return poui;
        },
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