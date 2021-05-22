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
            const pouis = await PointOfUninterest.find( { creator: request.params.id } );
            return pouis;
        },
    },

    deleteAll: {
        auth: false,
        handler: async function (request, h) {
            await PointOfUninterest.deleteMany({});
            return { success: true };
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
    }

}
module.exports = PointsOfUninterest;