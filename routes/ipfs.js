const express = require('express');
const router = express.Router();

//packages required to upload pdf with pinata
const axios = require('axios');          //to send a post req to pinata
const multer = require('multer');        //https://www.npmjs.com/package/multer 
const FormData = require("form-data");
const { Readable } = require('stream');
const upload = multer();                 //use as middelware to get file buffer
//...

//Prepare info to send to pinata
const gateway = process.env.GATEWAY;
//...

//Send post requesto to pinata to upload file
router.post('/add-certificate', upload.single('file'), async (req, res) => {
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
      pinataFileRes = await uploadFile(fileName, fileBuffer);
      pinataJsonRes = await uploadJson(pinataFileRes.data.IpfsHash, name, description, category, date_achievement, date_expiration, issuing_authority);
      res.status(201).json(pinataJsonRes.data);
      
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
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY
    }
  }).catch(function (error) {
    console.log("error..");
    console.log(error);
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
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_KEY
    },
    data : certificateJSON
  };
  
  // Send post request to pinata
  const pinataJsonRes = await axios(config).catch(error => {console.log(error);});
  
  // Add gateway to Json CID 
  pinataJsonRes.data.IpfsHash = gateway + pinataJsonRes.data.IpfsHash; 
  return pinataJsonRes;
}
//...

module.exports = router