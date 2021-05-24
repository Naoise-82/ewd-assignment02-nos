"use strict";

const assert = require("chai").assert;
const POUIService = require("./poui-service");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("User API tests", function () {
  let users = fixtures.users;
  let newUsers = fixtures.newUsers;

  const pouiService = new POUIService(fixtures.pouiService);

  setup(async function () {
    await pouiService.deleteAllUsers();
  });

  teardown(async function () {
    await pouiService.deleteAllUsers();
  });

  test("create a user", async function () {
    const returnedUser = await pouiService.createUser(newUsers[0]);
    assert(_.some([returnedUser], newUser), "returnedUser must be a superset of newUser");
    assert.isDefined(returnedUser._id);
  });

  test("get user", async function () {
    const u1 = await pouiService.createUser(newUsers[0]);
    const u2 = await pouiService.getUser(u1._id);
    assert.deepEqual(u1, u2);
  });

  test("get invalid user", async function () {
    const u1 = await pouiService.getUser("1234");
    assert.isNull(u1);
    const u2 = await pouiService.getUser("012345678901234567890123");
    assert.isNull(u2);
  });

  test("delete a user", async function () {
    let u = await pouiService.createUser(newUsers[0]);
    assert(u._id != null);
    await pouiService.deleteOneUser(u._id);
    u = await pouiService.getUser(u._id);
    assert(u == null);
  });

  test("get all users", async function () {
    for (let u of users) {
      await pouiService.createUser(u);
    }

    const allUsers = await pouiService.getUsers();
    assert.equal(allUsers.length, users.length);
  });

  test("get users detail", async function () {
    for (let u of users) {
      await pouiService.createUser(u);
    }

    const allUsers = await pouiService.getUsers();
    for (var i = 0; i < users.length; i++) {
      assert(_.some([allUsers[i]], users[i]), "returnedUser must be a superset of newUser");
    }
  });

  test("get all users empty", async function () {
    const allUsers = await pouiService.getUsers();
    assert.equal(allUsers.length, 0);
  });
});
