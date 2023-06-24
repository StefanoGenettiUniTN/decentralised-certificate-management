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

module.exports = router