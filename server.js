//Express App initialization
const express = require("express");
const server = express();
//...

//Smart contract files
var certificate = require("./build/contracts/Certificate.json");
var eagle = require("./build/contracts/Eagle.json");
//...

//packages required to upload pdf with pinata
const axios = require('axios') //to send a post req to pinata
const multer = require('multer') //https://www.npmjs.com/package/multer 
const FormData = require("form-data");
const { Readable } = require('stream');
const dotenv = require('dotenv');

dotenv.config()
const upload = multer() //use as middelware to get file buffer
//...

//Prepare info to send to pinata
const JWT = 'Bearer ' + process.env.PINATA_JWT
const gateway = process.env.GATEWAY
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

//Send post requesto to pinata to upload file
server.post('/test-page', upload.single('file'), async (req, res) => {

    try {
      // get file info
      var fileName = req.file.originalname;
      var fileBuffer = req.file.buffer;  //get the fileBuffer, an array of bytes 
  
      // get json info
      var name = req.body.name;
      var description = req.body.description;
      var category = req.body.category;
      var date_achievement = req.body.date_achievement;
      var date_expiration = req.body.date_expiration;
      var issuing_authority = req.body.issuing_authority;

      pinataFileRes = await uploadFile(fileName, fileBuffer)
      pinataJsonRes = await uploadJson(pinataFileRes.data.IpfsHash, name, description, category, date_achievement, date_expiration, issuing_authority)
      
      res.status(201).json(pinataJsonRes.data)  
      
    } catch (error) {
      res.status(400);
      res.json({ error: 'Bad Request' });
    }
});

async function uploadFile(fileName, fileBuffer) {
   // prepare json containing file info to send to pinata
   const stream = Readable.from(fileBuffer);
   const data = new FormData();
   data.append('file', stream, {
     filepath: fileName
   })
   
   //Upload file to IPFS
   const pinataFileRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
     maxBodyLength: "Infinity",
     headers: {
         'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
         Authorization: JWT
     }
   });

   return pinataFileRes;
}

async function uploadJson(fileCID, name, description, category, date_achievement, date_expiration, issuing_authority) {
  // Create json to be uplaoded
  var certificateJSON = JSON.stringify({
    "pinataOptions": {
      "cidVersion": 1
    },
    "pinataMetadata": {
      "name": name + ".json"
    },
    "pinataContent": {
      "name": name,
      "description": description,
      "document": gateway + fileCID,
      "category": category,
      "validity": "true",
      "date_achievement": date_achievement,
      "date_expiration": date_expiration,
      "issuing_authority": issuing_authority
    }
  });
  
  // Prepare post request
  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': JWT
    },
    data : certificateJSON
  };
  
  // Send post request to pinata
  const pinataJsonRes = await axios(config);
  
  // Add gateway to Json CID 
  pinataJsonRes.data.IpfsHash = gateway + pinataJsonRes.data.IpfsHash; 
  return pinataJsonRes;
}
//...

//Default 404 handler
server.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});
//...

module.exports = server;