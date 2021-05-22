"use strict";

const assert = require("chai").assert;
const POUIService = require("./poui-service");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("POUI API tests", function () {
    let pouis = fixtures.pouis;
    let newUser = fixtures.newUser;

    const pouiService = new POUIService(fixtures.pouiService);

    setup( async function () {
        pouiService.deleteAllPOUIs();
        pouiService.deleteAllUsers();
    });

    teardown(async function () {});

    test("create a point of uninterest", async function () {
        const returnedUser = await pouiService.createUser(newUser);
        console.log(returnedUser);
        await pouiService.createPOUI(returnedUser._id, pouis[0]);
        const returnedPOUIs = await pouiService.getPOUIs(returnedUser._id);
        console.log(returnedPOUIs);
        assert.equal(returnedPOUIs.length, 1);
        assert(_.some([returnedPOUIs[0], pouis[0], "returned poui must be a superset of poui"]))
    });

})