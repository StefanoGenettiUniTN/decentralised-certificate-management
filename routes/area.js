const express = require('express');
const router = express.Router();
const Areas = require('../models/area');

router.get('/areas', async (req, res) => {
    let areas = await Areas.find({});
    
    let response = areas.map( (area) => {
        return {
            self: "/api/v1/areas/"+area.area_id,
            area_id: area.area_id,
            name: area.name
        };
    });
    res.status(200).json(response);
});

module.exports = router;