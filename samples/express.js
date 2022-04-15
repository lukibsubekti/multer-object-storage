// to run this example, first you must install the dependencies and set a .env file

require('dotenv').config();
const express = require('express');
const multer  = require('multer')
const { ObjectStorage } = require('../built');
const app = express();
const port = 3000

// create & configure storage instance
// each option uses callback function format
const storage = new ObjectStorage({
  // optional: set file name generator 
  // by default it will use "short-uuid" plus original file name
  filename: function (req, file, cb) {
    cb(
      null,
      Math.ceil(Math.random() * 10000) + file.originalname,
    );
  },

  // optional: set destination directory for disk storing, 
  // by default its result is set to "uploads/" relative to the project directory
  // set it to null if you don't want to store files on disk
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },

  // optional: set list of image resize options, based on Sharp resize options
  resize: function (req, file, cb) {
    cb(null, {
      // set allowed image mime-types that can be resized
      mimeTypes: ['image/jpeg', 'image/png'], 
      options: [
        {
          width: 200,
          height: 150,
          // by default, file name will be appended by string with format "w{width}-h{height}"
          // you can set custom postfix here
          fileNameTail: 'thumb', 
        },
        {
          width: 300, // height will be auto based on image ratio
        },
      ],
    });
  },

  // optional: set S3-compatible object storage credentials
  // store your creds in ".env" file first before run this sample
  bucket: function (req, file, cb) {
    cb(null, {
      name: process.env.BUCKET_NAME,
      endpoint: process.env.BUCKET_ENDPOINT, // include protocol, eg. https://sgp1.digitaloceanspaces.com
      accessKeyId: process.env.BUCKET_ACCESS_ID,
      secretAccessKey: process.env.BUCKET_SECRET_KEY,
    });
  },
});

// set object storage option in the multer initiation
const upload = multer({ storage });

// allows 5 fields with name "image" and 2 fields with name "file"
const uploadHandler = upload.fields([{ name: 'image', maxCount: 5 }, { name: 'file', maxCount: 2 }]);

// send a multipart form-data that contains files to this endpoint
app.post('/upload', uploadHandler, (req, res) => {
  res.json(req.files);
});

app.get('/', (req, res) => {
  res.send(`POST request to http://localhost:${port}/upload to store some files.`)
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
