const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const Users = require('../models/user');

//Submit of a user in a course
//user id and course id have to be passed through the body
router.patch('/registrations', async (req, res, next) => {

    //console.log(req.body);

    //Check required attributes
    if  ( 
        !req.body.course_id     ||
        !req.body.user_blockchain_id
    )
    {
        console.log("Bad input - missing required information");
        res.status(400).send("Bad input - missing required information");
        return ;
    }

    //Add user to course subscribers
    let course_id = req.body.course_id;
    let user_blockchain_id = Number(req.body.user_blockchain_id);

    const filter = { _id: course_id };
    const update = { $push: { users: user_blockchain_id  } };

    try{
        let doc = await Course.findOneAndUpdate(filter,update);
    }catch(error){
        console.log(error);
        res.status(500).send(error);
    }

    next();

}, async (req, res, next) => {

    //Add course to user list of registrations
    let course_id = req.body.course_id;
    let user_blockchain_id = Number(req.body.user_blockchain_id);

    const filter = { blockchain_id: user_blockchain_id };
    const update = { $push: { courses: course_id  } };

    try{
        let doc = await Users.findOneAndUpdate(filter,update);
    }catch(error){
        console.log(error);
        res.status(500).send(error);
    }
    
    res.status(200).send("OK");
});

//Unsubscribtion of a user in a course
//user id and course id have to be passed through the body
router.patch('/unsubscribe', async (req, res, next) => {

    //Check required attributes
    if  ( 
        !req.body.course_id     ||
        !req.body.user_blockchain_id
    )
    {
        res.status(400).send("Bad input - missing required information");
        return ;
    }

    //Delete user to course subscribers
    let course_id = req.body.course_id;
    let user_blockchain_id = Number(req.body.user_blockchain_id);

    const filter = { _id: course_id };
    const update = { $pull: { users: user_blockchain_id  } };

    try{
        let doc = await Course.findOneAndUpdate(filter,update);
    }catch(error){
        console.log(error);
        res.status(500).send(error);
    }

    next();

}, async (req, res, next) => {

    //Delete course to user list of registrations
    let course_id = req.body.course_id;
    let user_blockchain_id = Number(req.body.user_blockchain_id);

    const filter = { blockchain_id: user_blockchain_id };
    const update = { $pull: { courses: course_id  } };

    try{
        let doc = await Users.findOneAndUpdate(filter,update);
    }catch(error){
        console.log(error);
        res.status(500).send(error);
    }

    res.status(200).send("OK");
});

module.exports = router