'use strict';

const User = require('../models/user');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

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
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().required(),
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
                const payload = request.payload;
                let user = await User.findByEmail(payload.email);
                if (user) {
                    const message = "Email address is already registered";
                    throw Boom.badData(message);
                }
                const newUser = new User({
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    password: payload.password
                });
                user = await newUser.save();
                request.cookieAuth.set({ id: user.id });
                return h.redirect("/home");
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
                user.comparePassword(password);
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
        handler: async function (request, h) {
            try {
                const userEdit = request.payload;
                const id = request.auth.credentials.id;
                const user = await User.findById(id);
                user.firstName = userEdit.firstName;
                user.lastName = userEdit.lastName;
                user.email = userEdit.email;
                user.password = userEdit.password;
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