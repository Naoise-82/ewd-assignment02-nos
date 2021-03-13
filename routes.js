'use strict';

const Accounts = require("./app/controllers/accounts");
const PointsOfUninterest = require("./app/controllers/points-of-uninterest");

module.exports = [
  { method: "GET", path: "/", config: Accounts.index },
  { method: "GET", path: "/signup", config: Accounts.showSignup },
  { method: "GET", path: "/login", config: Accounts.showLogin },
  { method: "GET", path: "/logout", config: Accounts.logout },
  { method: "POST", path: "/signup", config: Accounts.signup },
  { method: "POST", path: "/login", config: Accounts.login },

  { method: "GET", path: "/home", config: PointsOfUninterest.home },
  { method: "GET", path: "/report", config: PointsOfUninterest.report },
  { method: 'POST', path: '/create-poui', config: PointsOfUninterest.createPOUI },
  { method: 'POST', path: '/view-poui/:_id', config: PointsOfUninterest.viewPOUI },
  { method: 'GET', path: '/delete-poui/{_id}', config: PointsOfUninterest.deletePOUI },

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