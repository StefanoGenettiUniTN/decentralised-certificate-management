const mongoose = require("mongoose")

const schema = mongoose.Schema({
    area_id: Number,
    name: String
},{collection: 'area'})

module.exports = mongoose.model("Area", schema)