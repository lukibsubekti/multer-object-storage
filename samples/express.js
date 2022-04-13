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

  // optional: set destination directory for disk saving, 
  // by default it is set to "uploads/" relative to the project directory
  // set to null if you don't want to store files on disk
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },

  // optional: set list of image resize options, based on Sharp resize options
  resize: function (req, file, cb) {
    cb(null, {
      mimeTypes: ['image/jpg', 'image/jpeg', 'image/png'], // set allowed image mime-types that can be resized
      options: [
        {
          width: 200,
          height: 150,
          fileNameTail: 'thumb', // by default, file name will be appended by text with format "w{width}-h{height}"
        },
        {
          width: 300, // height will auto based on image ratio
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

// init upload middleware using multer
const upload = multer({ storage });

// set to allow 5 fields with name "image" and 2 fields with name "file"
const uploadHandler = upload.fields([{ name: 'image', maxCount: 5 }, { name: 'file', maxCount: 2 }]);

// send a multipart form-data that contain files here
app.post('/upload', uploadHandler, (req, res) => {
  res.json(req.files);
});

app.get('/', (req, res) => {
  res.send(`POST request to http://localhost:${port}/upload to store some files.`)
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
