'use strict';

const User = require('../models/user');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

// hashing and salting
const bcrypt = require("bcrypt");
const saltRounds = 10;


const Accounts = {
    index: {
        auth: false,
        handler: function (request, h) {
            return h.view('main', { title: 'Welcome to POUI Central' });
        }
    },
    showSignup: {
        auth: false,
        handler: function (request, h) {
            return h.view('signup', { title: 'Sign up for POUI Central' });
        }
    },

    signup: {
        auth: false,
        validate: {
            payload: {
                // First name must start with a capital letter and be at least 2 characters long
                firstName: Joi.string().regex(/^[A-Z][a-z]{2,}$/).required(),
                // last name must be at least 3 charatcers long
                lastName: Joi.string().required().min(3),
                email: Joi.string().email().required(),
                // Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 number and at least
                // one of this set of special characters: @#!?*£&
                password: Joi.string().regex(/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9])(?=\S*?[@#!?*£&]).{8,})\S$/).required(),
            },
            options: {
                abortEarly: false,
            },
            failAction: function (request, h, error) {
                return h
                    .view("signup", {
                        title: "Signup error",
                        errors: error.details,
                    })
                    .takeover()
                    .code(400);
            },
        },
        handler: async function (request, h) {
            try {
                const payload = request.payload;
                let user = await User.findByEmail(payload.email);
                if (user) {
                    const message = "Email address is already registered";
                    throw Boom.badData(message);
                }

                const hash = await bcrypt.hash(payload.password, saltRounds);

                const newUser = new User({
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    password: hash
                });
                user = await newUser.save();
                request.cookieAuth.set({ id: user.id });
                return h.redirect("/report");
            } catch (err) {
                return h.view("signup", { errors: [{ message: err.message }] });
            }
        }
    },

    showLogin: {
        auth: false,
        handler: function (request, h) {
            return h.view('login', { title: 'Login to POI Central' });
        }
    },

    login: {
        auth: false,
        validate: {
            payload: {
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            },
            options: {
                abortEarly: false,
            },
            failAction: function (request, h, error) {
                return h
                    .view("login", {
                        title: "Sign in error",
                        errors: error.details,
                    })
                    .takeover()
                    .code(400);
            },
        },
        handler: async function (request, h) {
            const { email, password } = request.payload;
            try {
                let user = await User.findByEmail(email);
                if (!user) {
                    const message = "Email address is not registered";
                    throw Boom.unauthorized(message);
                }
                await user.comparePassword(password);
                request.cookieAuth.set({ id: user.id });
                return h.redirect("/report");
            } catch (err) {
                return h.view("login", { errors: [{ message: err.message }] });
            }
        }
    },

    logout: {
        auth: false,
        handler: function (request, h) {
            request.cookieAuth.clear();
            return h.redirect('/');
        }
    },

    showSettings: {
        handler: async function (request, h) {
            try {
                const id = request.auth.credentials.id;
                const user = await User.findById(id).lean();
                return h.view("settings", { title: "Donation Settings", user: user });
            } catch (err) {
                return h.view("login", { errors: [{ message: err.message }] });
            }
        },
    },

    updateSettings: {
        validate: {
            payload: {
                firstName: Joi.string().regex(/^[A-Z][a-z]{2,}$/).required(),
                lastName: Joi.string().regex(/^[A-Z][a-z]$/).required().min(3),
                email: Joi.string().email().required(),
                password: Joi.string().regex(/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9])(?=\S*?[@#!?*£&]).{8,})\S$/).required(),
            },
            options: {
                abortEarly: false,
            },
            failAction: function (request, h, error) {
                return h
                    .view("settings", {
                        title: "Settings Update error",
                        errors: error.details,
                    })
                    .takeover()
                    .code(400);
            },
        },
        handler: async function (request, h) {
            try {
                const userEdit = request.payload;
                const id = request.auth.credentials.id;
                const user = await User.findById(id);
                user.firstName = userEdit.firstName;
                user.lastName = userEdit.lastName;
                user.email = userEdit.email;
                const hash = await bcrypt.hash(userEdit.password, saltRounds);
                user.password = hash;
                await user.save();
                return h.redirect('/settings');
            } catch (err) {
                return h.view("login", { errors: [{ message: err.message }] });
            }
        }
    },

    deleteAccount: {
        handler: async function (request, h) {
            try {
                const id = request.auth.credentials.id;
                const user = await User.findById(id);
                console.log("Removing User:" + user.firstName + " " + user.lastName);
                await user.remove();
                return h.redirect('/');
            } catch (err) {
                return h.view("login", { errors: [{ message: err.message }] });
            }
        }
    }
};

module.exports = Accounts;