const mongoose = require("mongoose")

const schema = mongoose.Schema({
    blockchain_id: Number,
    name: String,
    surname: String,
    email: String,
    courses: [mongoose.Schema.Types.ObjectId]
},{collection: 'user'})

module.exports = mongoose.model("User", schema)