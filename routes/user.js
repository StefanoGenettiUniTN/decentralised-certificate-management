const express = require('express');
const router = express.Router();
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

router.post('/users', async (req, res) => {
    let blockchain_id = req.body.memberId;
    let name = req.body.memberName;
    let surname = req.body.memberSurname;
    let area = req.body.memberArea;

    if(!blockchain_id || !name || !surname || !area){
        res.status(400).send("Bad input - missing required information");
        return;
    }

    const userExists = await Users.findOne({blockchain_id: blockchain_id});
    if(userExists){res.status(409).send("User already inserted"); return;}

    let user = new Users({
        blockchain_id: blockchain_id,
        name: name,
        surname: surname,
        courses: [],
        area: area
    });

    await user.save();

    res.status(201).send();
})

router.get('/users/:id', async (req, res) => {
    let user_id = req.params.id;
    let user = await Users.findOne({'blockchain_id':user_id});
    if(!user){
        res.status(404).json({status: "error", message: "User not found"});
        console.log("User not found");
        return;
    }
    let response = {
        self: "/api/v1/users/"+user.blockchain_id,
        name: user.name,
        surname: user.surname,
        blockchain_id: user.blockchain_id,
        courses: user.courses,
        area: user.area
    };
    res.status(200).json(response);
});

router.delete('/users/:id', async (req, res) => {
    let user_id = req.params.id;
    let user = await Users.findOne({blockchain_id: user_id});
    if(!user){
        res.status(404).json({status: "error"})
        console.log('resource not found');
        return;
    }

    await user.deleteOne();
    res.status(204).send();
})

router.patch('/users/:id', async (req, res) => {
    let user_id = req.params.id;
    let user = await Users.findOneAndUpdate({blockchain_id: user_id}, req.body, {new: true});
    if(!user){
        res.status(404).json({status: "error"})
        console.log('resource not found');
        return;
    }
    res.status(200).send(user);
})

module.exports = router