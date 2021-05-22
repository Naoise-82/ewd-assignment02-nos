'use strict';

const axios = require("axios");

class POUIService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async getUsers() {
        try {
            const response = await axios.get(this.baseUrl + "/api/users");
            return response.data;
        } catch (e) {
            return null;
        }
    }

    async getUser(id) {
        try {
            const response = await axios.get(this.baseUrl + "/api/users/" + id);
            return response.data;
        } catch (e) {
            return null;
        }
    }

    async createUser(newUser) {
        try {
            const response = await axios.post(this.baseUrl + "/api/users", newUser);
            return response.data;
        } catch (e) {
            return null;
        }
    }

    async deleteAllUsers() {
        try {
            const response = await axios.delete(this.baseUrl + "/api/users");
            return response.data;
        } catch (e) {
            return null;
        }
    }

    async deleteOneUser(id) {
        try {
            const response = await axios.delete(this.baseUrl + "/api/users/" + id);
            return response.data;
        } catch (e) {
            return null;
        }
    }

    async getPOUIs(id) {
        try {
            const response = await axios.get(this.baseUrl + "/api/users/" + id + "/points-of-uninterest");
            return response.data;
        } catch (e) {
            return null;
        }
    }

    async deleteAllPOUIs() {
        try {
            const response = await axios.delete(this.baseUrl + "/api/points-of-uninterest");
            return response.data;
        } catch (e) {
            return null;
        }
    }

    async createPOUI(id, poui) {
        try {
            const response = await axios.post(this.baseUrl + "/api/users/" + id + "/points-of-uninterest", poui);
            return response.data;
        } catch (e) {
            return null;
        }
    }
}

module.exports = POUIService;