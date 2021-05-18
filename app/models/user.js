"use strict";

const Boom = require("@hapi/boom");
const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String
});

userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email });
};

userSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    if (!isMatch) {
        throw Boom.unauthorized('Password mismatch');
    }
    return this;
};

module.exports = Mongoose.model("User", userSchema);