## Description
A storage engine of Express Multer middleware 
that can store your file on disk or/and S3-compatible object storage.
It also can be set to generate custom resolutions of your uploaded image files.
It utilizes [AWS-SDK v3](https://github.com/aws/aws-sdk-js-v3) for managing object storage files 
and [Sharp](https://sharp.pixelplumbing.com/) for image resizing.
Usage example can be found in `samples/express.js`.

## Features
1. Save to S3-compatible storage
1. Save to disk
1. Image resizing

## Usage
1. Install the package to your project
    ```bash
    yarn add multer-object-storage
    ```
    or
    ```bash
    npm i multer-object-storage
    ```
1. Create storage instance
    ```javascript
    const { ObjectStorage } = require('multer-object-storage');
    const storage = new ObjectStorage({ ...options });
    ```
1. Add the storage instance as the multer constructor parameter
    ```javascript
    const multer = require('multer');
    // set the storage option
    const upload = multer({ storage });
    // create middleware function that accept multiple fields & multiple files
    const uploadHandler = upload.fields([
      { name: 'image', maxCount: 10 }, 
      { name: 'file', maxCount: 2 },
    ]);
    // set the middleware as a request handler
    app.post('/upload', uploadHandler, (req, res) => {
      res.json(req.files); // req.files will contain the uploaded files
    });
    ```

## Constructor Option Parameters
All storage option parameters are formatted as a function with a callback parameter 
to follow guidance from [multer documentation](https://github.com/expressjs/multer/blob/master/StorageEngine.md) 
and keep the storage to be flexible and customisable.
- `filename`: `(req: express.Request, file: Express.Multer.File, cb: (err: Error, result) => void) => void`
    By default the `result` will be `shortUUID.generate() + file.originalname`.
    Example:
    ```javascript
    const storage = new ObjectStorage({
      filename: (req, file, cb) => {
        const result = Math.ceil(Math.random() * 1000000) + file.originalname;
        cb(null, result);
      }
    });
    ```

- `destination`: `(req: express.Request, file: Express.Multer.File, cb: (err: Error, result) => void) => void`
    By default, the storage will store uploaded files into `uploads/` diriectory. 
    NOTE: You must make sure that the directory exists.
    Example:
    ```javascript
    const storage = new ObjectStorage({
      destination: (req, file, cb) => {
        const result = null; // set storage to ignore file storing to disk
        cb(null, result);
      }
    });
    ```
- `bucket`: `(req: express.Request, file: Express.Multer.File, cb: (err, result) => void) => void`
    By default, it is `null` that means the storage won't store the file to any S3-compatible storage.
    Example:
    ```javascript
    const storage = new ObjectStorage({
      bucket: (req, file, cb) => {
        const result = {
          name: 'bucket name',
          endpoint: 'object storage endpoint', // must include the protocol, eg. https://us.storage.com
          accessKeyId: 'object storage access ID',
          secretAccessKey: 'object storage secret key',
        };
        cb(null, result);
      }
    });
    ```
- `resize`: `(req: express.Request, file: Express.Multer.File, cb: (err, result) => void) => void`
    By default, it is `null` that means the storage won't resize any **image** files.
    This parameter only affects image files. If non-image file is passed, the storage won't apply any resizing process to that file.
    Currently, an image file is a file with Mime-Type `image/jpeg` or `image/png`.
    Example:
    ```javascript
    const storage = new ObjectStorage({
      resize: (req, file, cb) => {
        const result = {
          // additional mime-type filtering, to resize only specific types
          mimeTypes: ['image/jpeg'],
          
          // it alligns with Sharp resize options with an additional field
          options: [
            {
              width: 200,
              height: 150,
              fit: 'cover', // other options: contain, fill, inside, outside
              // set custom string to be appended to the end of file name
              // if the file name contains extension, it will be inserted before the extension
              // by default, file name will be appended by a string with format "w{width}-h{height}"
              fileNameTail: 'thumb', 
            },
            {
              width: 300, // height will auto based on image ratio
            },
          ],
        };
        cb(null, result);
      }
    });

    ```

## Example Result
This is an example of `req.files` result based on specific configuration.
```javascript
{
    "image": [
        {
            "fieldname": "image",
            "originalname": "ace-2.jpg",
            "encoding": "7bit",
            "mimetype": "image/jpeg",
            "destination": "uploads/",
            "filename": "3147ace-2.jpg",
            "path": "C:\\path\\to\\uploads\\3147ace-2.jpg", // location of the original file
            "size": 111083, // file size in bytes
            "url": "https://xxx.yyy.digitaloceanspaces.com/3147ace-2.jpg", // S3 object location of the original file
            "width": 669, // only for image
            "height": 562, // only for image
            "resize": [ // only for image
                {
                    "path": "C:\\path\\to\\uploads\\3147ace-2thumb.jpg",
                    "url": "https://xxx.yyy.digitaloceanspaces.com/3147ace-2thumb.jpg",
                    "width": 200,
                    "height": 150
                },
                {
                    "path": "C:\\path\\to\\uploads\\3147ace-2w300hauto.jpg",
                    "url": "https://xxx.yyy.digitaloceanspaces.com/3147ace-2w300hauto.jpg",
                    "width": 300,
                    "height": null // auto size will be set to null
                }
            ]
        },
        {
            "fieldname": "image",
            "originalname": "ace-3.jpg",
            "encoding": "7bit",
            "mimetype": "image/jpeg",
            "destination": "uploads/",
            "filename": "5995ace-3.jpg",
            "path": "C:\\path\\to\\uploads\\5995ace-3.jpg",
            "size": 72135,
            "url": "https://xxx.yyy.digitaloceanspaces.com/5995ace-3.jpg",
            "width": 640,
            "height": 427,
            "resize": [
                {
                    "path": "C:\\\path\\to\\uploads\\5995ace-3thumb.jpg",
                    "url": "https://xxx.yyy.digitaloceanspaces.com/5995ace-3thumb.jpg",
                    "width": 200,
                    "height": 150
                },
                {
                    "path": "C:\\path\\to\\uploads\\5995ace-3w300hauto.jpg",
                    "url": "https://xxx.yyy.digitaloceanspaces.com/5995ace-3w300hauto.jpg",
                    "width": 300,
                    "height": null
                }
            ]
        }
    ]
}
```

## Support and Feature Requests
You can submit issues on the [Github page](https://github.com/lukibsubekti/multer-object-storage/issues).
