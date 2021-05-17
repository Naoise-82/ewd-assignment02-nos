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
  { method: "GET", path: "/view-all-poui", config: PointsOfUninterest.viewAllPOUI },
  { method: "POST", path: "/search-poui", config: PointsOfUninterest.searchPOUI },
  { method: 'POST', path: '/create-poui', config: PointsOfUninterest.createPOUI },
  { method: 'GET', path: '/view-poui/{_id}', config: PointsOfUninterest.viewPOUI },
  { method: 'POST', path: '/submit-review/{_id}', config: PointsOfUninterest.submitReview },
  { method: 'POST', path: '/upvote/{_id}', config: PointsOfUninterest.upVote },
  { method: 'GET', path: '/edit-poui-page/{_id}', config: PointsOfUninterest.editPOUIPage },
  { method: 'POST', path: '/edit-poui/{_id}', config: PointsOfUninterest.editPOUI },
  { method: 'GET', path: '/delete-poui/{_id}', config: PointsOfUninterest.deletePOUI },

  { method: 'GET', path: '/settings', config: Accounts.showSettings },
  { method: 'POST', path: '/settings', config: Accounts.updateSettings },
  { method: 'POST', path: '/delete-account', config: Accounts.deleteAccount },

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