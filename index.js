const server = require("./server.js");
const mongoose = require("mongoose");

const port = process.env.PORT || 8080;
const db_url = process.env.DB_URL;

mongoose.connect(db_url, {useNewUrlParser: true, useUnifiedTopology: true})
.then (() => {
    console.log("Connected to the Database");
    server.listen(port, function() {
        console.log('Server listening on port ', port);
    });
})
.catch((err)=>{
    console.error("ERROR: db connection error");
    console.error(err)
});