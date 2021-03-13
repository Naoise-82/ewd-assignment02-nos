'use strict';

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Handlebars = require('handlebars');
const Cookie = require('@hapi/cookie');
require('./app/models/db');
const env = require('dotenv');
const Joi = require("@hapi/joi")

env.config();

const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  async function init() {
    await server.register(Inert);
    await server.register(Vision);
    await server.register(Cookie);
    server.validator(require("@hapi/joi"));
  
    server.auth.strategy('session', 'cookie', {
      cookie: {
        name: process.env.cookie_name,
        password: process.env.cookie_password,
        isSecure: false,
      },
      redirectTo: '/',
    });
  
    server.auth.default('session');
  
    server.route(require('./routes'));
    
    server.views({
      engines: {
        hbs: Handlebars,
      },
      relativeTo: __dirname,
      path: './app/views',
      layoutPath: './app/views/layouts',
      partialsPath: './app/views/partials',
      layout: true,
      isCached: false,
    });
  
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
  }
  
  process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
  });
  
  init();