const Users = require("./app/api/users");
const PointsOfUninterest = require("./app/api/points-of-uninterest");

module.exports = [

  { method: "GET", path: "/api/users", config: Users.find },
  { method: "GET", path: "/api/users/{id}", config: Users.findOne },
  { method: "POST", path: "/api/users", config: Users.create },
  { method: "DELETE", path: "/api/users/{id}", config: Users.deleteOne },
  { method: "DELETE", path: "/api/users", config: Users.deleteAll },

  
  { method: "GET", path: "/api/points-of-uninterest", config: PointsOfUninterest.findAll },
  { method: "GET", path: "/api/users/{id}/points-of-uninterest", config: PointsOfUninterest.findByCreator },
  { method: "POST", path: "/api/users/{id}/points-of-uninterest", config: PointsOfUninterest.createPOUI },
  { method: "POST", path: "/api/users/{userId}/points-of-uninterest/{pouiId}/{voteValue}", config: PointsOfUninterest.voteOnPOUI },
  { method: "POST", path: "/api/points-of-uninterest/{pouiId}/users/{userId}/{comment}", config: PointsOfUninterest.reviewPOUI },
  { method: "DELETE", path: "/api/points-of-uninterest", config: PointsOfUninterest.deleteAll },
  { method: "DELETE", path: "/api/points-of-uninterest/{id}", config: PointsOfUninterest.deleteOne },
];
