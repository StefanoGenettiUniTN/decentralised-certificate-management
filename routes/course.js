const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const Users = require('../models/user');

router.get('/courses', async (req, res) => {
    let courses = await Course.find({});
    let response = courses.map( (course) => {
        return {
            self: "/api/v1/courses/" + course.id,
            title: course.title,
            description: course.description,
            date: course.date,
            users: course.users
        };
    });
    res.status(200).json(response);
});

module.exports = router