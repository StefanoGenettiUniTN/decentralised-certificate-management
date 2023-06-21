const express = require('express');
const mongoose = require("mongoose");
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

router.get('/courses/:id/users', async (req, res) => {

    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        res.status(404).json({status: "error"})
        console.log('resource not found')
        return;
    }

    let courses = await Course.findOne({_id:req.params.id});

    if (!courses) {
        res.status(404).json({status: "error"})
        console.log('resource not found')
        return;
    }

    let users = await Users.find({blockchain_id: {$in: courses.users}});
    let response = users.map( (user) => {
        return {
            self: "/api/v1/courses/" + req.params.id,
            name: user.name,
            surname: user.surname,
            blockchain_id: user.blockchain_id,
            user: "/api/v1/users/"+user.blockchain_id
        };
    });
    res.status(200).json(response);
});

router.delete('/courses/:id', async (req, res) => {
    let course = await Course.findById(req.params.id).exec();
    if (!course) {
        res.status(404).json({status: "error"})
        console.log('resource not found')
        return;
    }
    await course.deleteOne()
    res.status(204).json({status: "success"});
});

module.exports = router