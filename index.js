const express = require('express')
const axios = require('axios')
const path = require("path")
const multer = require('multer') //https://www.npmjs.com/package/multer 
const FormData = require("form-data");
const { Readable } = require('stream');
const dotenv = require('dotenv');

dotenv.config()


var app = express();
const router = express.Router()

const upload = multer() //use as middelware to get file buffer

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.static(path.join(__dirname, ''))); // set static directories
app.use(express.urlencoded({ extended: true })) //to decode form post req

port = 8080
const apiKey = process.env.PINATA_APY_KEY
const apiSecret = process.env.PINATA_SECRET_KEY
const JWT = 'Bearer ' + process.env.PINATA_JWT

//start server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+ 'index.html'));
})

//handle form post request
app.post('/test-page', upload.single('inFile'), async (req, res) => {
   
    var fileName = req.body.fileName;
    var fileBuffer = req.file.buffer;  //get the fileBuffer, the file in binary form 

    try {
      const stream = Readable.from(fileBuffer); //convert buffer into a readable stream
      
      const data = new FormData();
      data.append('file', stream, {
        filepath: fileName 
      })
  
      // Send post req to pinata
      const postRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        maxBodyLength: "Infinity",
        headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            'pinata_api_key': apiKey,
            'pinata_secret_api_key': apiSecret
        }
      });
  
      console.log(postRes.data);     
      res.send("Caricato") 

    } catch (error) {
      console.log(error);
      res.send("Errore")
    }   
});
  

