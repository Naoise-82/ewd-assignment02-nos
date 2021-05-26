"use strict";

const assert = require("chai").assert;
const POUIService = require("./poui-service");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("POUI API tests", function () {
    let pouis = fixtures.pouis;
    let newUsers = fixtures.newUsers;
    let reviewComments = fixtures.reviewComments;

    const pouiService = new POUIService(fixtures.pouiService);

    setup( async function () {
        pouiService.deleteAllPOUIs();
        pouiService.deleteAllUsers();
    });

    teardown(async function () {
        pouiService.deleteAllPOUIs();
        pouiService.deleteAllUsers();
    });

    test("create a point of uninterest", async function () {
        const returnedUser = await pouiService.createUser(newUsers[0]);
        await pouiService.createPOUI(returnedUser._id, pouis[0]);
        const returnedPOUIs = await pouiService.getPOUIs(returnedUser._id);
        assert.equal(returnedPOUIs.length, 1);
        assert(_.some([returnedPOUIs[0], pouis[0], "returned poui must be a superset of poui"]))
    });

    test("create several points of uninterest", async function () {
        const returnedUser = await pouiService.createUser(newUsers[0]);

        const pouis = fixtures.pouis;
        for ( var i = 0; i < pouis.length; i++) {
            await pouiService.createPOUI(returnedUser._id, pouis[i]);
        }
     
        const returnedPOUIs = await pouiService.getPOUIs(returnedUser._id);
        assert.equal(returnedPOUIs.length, pouis.length);
        for (var i = 0; i < returnedPOUIs.length; i++) {
        assert(_.some([returnedPOUIs[i], pouis[i], "returned poui must be a superset of poui"]))
        }
    });


    test("delete a point of uninterest", async function () {
        const returnedUser = await pouiService.createUser(newUsers[0]);
        await pouiService.createPOUI(returnedUser._id, pouis[0]);
        const p1 = await pouiService.getPOUIs(returnedUser._id);
        assert.equal(p1.length, 1);
        await pouiService.deletOnePOUI(p1[0]._id);
        const p2 = await pouiService.getPOUIs(returnedUser._id);
        console.log(p2);
        assert.equal(p2.length, 0);
    });

    test("delete all points of uninterest", async function () {
        const returnedUser = await pouiService.createUser(newUsers[0]);
        console.log(returnedUser);

        for (var i = 0; i < pouis.length; i++) {
            await pouiService.createPOUI(returnedUser._id, pouis[i]);
        }

        const p1 = await pouiService.getPOUIs(returnedUser._id);
        assert.equal(p1.length, pouis.length);
        await pouiService.deleteAllPOUIs();
        const p2 = await pouiService.getPOUIs(returnedUser._id);
        assert.equal(p2.length, 0);
    });

    test("vote on a point of uninterest", async function () {
        const returnedUser1 = await pouiService.createUser(newUsers[0]);
        const returnedUser2 = await pouiService.createUser(newUsers[1]);
        console.log(returnedUser2);
        await pouiService.createPOUI(returnedUser1._id, pouis[0]);
        const returnedPOUIs = await pouiService.getPOUIs(returnedUser1._id);
        console.log(returnedPOUIs[0]);
        assert.equal(returnedPOUIs[0].ratings.thumbsUp, 0);
        const voteValue = "thumbsUp";
        await pouiService.voteOnPOUI(returnedPOUIs[0]._id, returnedUser2._id, voteValue);
        console.log(returnedPOUIs[0]);
        assert.equal(returnedPOUIs[0].ratings.thumbsUp, 1);
    });

    test("add a review to a point of uninterest", async function () {
        const returnedUser1 = await pouiService.createUser(newUsers[0]);
        const returnedUser2 = await pouiService.createUser(newUsers[1]);
        console.log(returnedUser2);
        await pouiService.createPOUI(returnedUser1._id, pouis[0]);
        const returnedPOUIs = await pouiService.getPOUIs(returnedUser1._id);
        console.log(returnedPOUIs[0]);
        assert.equal(returnedPOUIs[0].reviews.length, 0);
        const comment = reviewComments[0];
        console.log(comment);
        await pouiService.reviewPOUI(returnedUser2._id, returnedPOUIs[0]._id, comment);
        console.log(returnedPOUIs[0]);
        assert.equal(returnedPOUIs[0].reviews.length, 1);
    });
})