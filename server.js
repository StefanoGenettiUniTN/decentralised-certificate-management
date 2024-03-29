// Express App initialization
const express = require("express");
const server = express();
//...

// Smart contract files
var certificate = require("./build/contracts/Certificate.json");
var eagle = require("./build/contracts/Eagle.json");
//...

// Resource REST API VERSION 1
const course = require('./routes/course.js');
const subscription = require('./routes/subscription.js');
const ipfs = require('./routes/ipfs.js');
const user = require('./routes/user.js');
const area = require('./routes/area.js');
//...

// Configure Express.js parsing middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
//...

// Serve front-end
server.use('/', express.static('src'));
//...

// Certificate smart contract
server.get("/Certificate.json", function (request, response) {
    response.send(certificate);
});
//...

// Eagle smart contract
server.get("/Eagle.json", function (request, response) {
    response.send(eagle);
});
//...

// Course API
server.use("/api/v1", course);
//...

// Subscription API
server.use("/api/v1", subscription);
//...

// Certificate API
server.use("/api/v1", ipfs);
//...

// User API
server.use("/api/v1", user);
//...

// Area API
server.use("/api/v1", area);

// Default 404 handler
server.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});
//...

module.exports = server;