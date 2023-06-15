//Express App initialization
const express = require("express");
const server = express();
//...

//Smart contract files
var certificate = require("./build/contracts/Certificate.json");
var eagle = require("./build/contracts/Eagle.json");
//...

//Configure Express.js parsing middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
//...

//Serve front-end
server.use('/', express.static('src'));
//...

//Certificate smart contract
server.get("/Certificate.json", function (request, response) {
    response.send(certificate);
});
//...

//Eagle smart contract
server.get("/Eagle.json", function (request, response) {
    response.send(eagle);
});
//...

//Default 404 handler
server.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});
//...

module.exports = server;