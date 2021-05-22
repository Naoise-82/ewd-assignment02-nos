'use strict';

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Handlebars = require('handlebars');
const Cookie = require('@hapi/cookie');
require('./app/models/db');
const dotenv = require('dotenv');
const Joi = require("@hapi/joi")
const fs = require('fs');

const result = dotenv.config();
if (result.error) {
  console.log(result.error,message);
  process.exit(1);
}

const server = Hapi.server({
  port: process.env.PORT || 3000,
  /*tls: {
    key: fs.readFileSync('keys/private/webserver.key'),
    cert: fs.readFileSync('keys/webserver.crt')
  },
  routes: { cors: true },*/
  });

  async function init() {
    await server.register(Inert);
    await server.register(Vision);
    await server.register(Cookie);
    server.validator(require("@hapi/joi"));
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
    server.route(require('./routes-api'))
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
  }
  
  process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
  });
  
  init();