'use strict';

const Accounts = require("./app/controllers/accounts");
const Donations = require("./app/controllers/points-of-uninterest");

module.exports = [
  { method: "GET", path: "/", config: Accounts.index },
  { method: "GET", path: "/signup", config: Accounts.showSignup },
  { method: "GET", path: "/login", config: Accounts.showLogin },
  { method: "GET", path: "/logout", config: Accounts.logout },
  { method: "POST", path: "/signup", config: Accounts.signup },
  { method: "POST", path: "/login", config: Accounts.login },

  { method: "GET", path: "/home", config: Donations.home },
  { method: "GET", path: "/report", config: Donations.report },
  { method: 'POST', path: '/donate', config: Donations.donate },

  { method: 'GET', path: '/settings', config: Accounts.showSettings },
  { method: 'POST', path: '/settings', config: Accounts.updateSettings },

  {
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: "./public",
      }
    },
    options: { auth: false }
  }
];