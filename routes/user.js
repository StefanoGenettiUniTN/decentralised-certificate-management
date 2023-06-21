const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const Course = require('../models/course');
const Users = require('../models/user');

router.get('/users', async (req, res) => {
    let users = await Users.find({});

    let response = users.map( (user) => {
        return {
            self: "/api/v1/users/"+user.blockchain_id,
            name: user.name,
            surname: user.surname,
            blockchain_id: user.blockchain_id,
            courses: user.courses
        };
    });
    res.status(200).json(response);
});

module.exports = router