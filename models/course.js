const mongoose = require("mongoose");

const course_schema = mongoose.Schema({
    title: String,
    description: String,
    date: Date,
    users: [mongoose.Schema.Types.ObjectId]
},{collection: 'course'});

module.exports = mongoose.model("Course", course_schema);