import { unlink } from 'fs';
import { Request } from 'express';
import sharp from 'sharp';
import {
  imageMimeTypes,
  ObjectBucketOptions,
  CallbackObject,
  ObjectResizeOptions,
  ObjectStorageBucket,
  ObjectStorageDestination,
  ObjectStorageFileName,
  ObjectStorageOptions,
  ObjectStorageResize,
  ProcessObject,
  StoreImageResultItem,
  CallbackResizeObject,
} from './lib/types.lib';
import {
  getCallbackObject,
  getCallbackObjectFromResize,
  getDefaultBucket,
  getDefaultDestination,
  getDefaultFileName,
  getDefaultResize,
  getFullPath,
  getResizeFullPath,
  promisify,
} from './lib/helpers.lib';
import { storeFileStream, storeSharpStream } from './lib/store.lib';

export class ObjectStorage {
  getDestination: ObjectStorageDestination;

  getFileName: ObjectStorageFileName;

  getResize: ObjectStorageResize;

  getBucket: ObjectStorageBucket;

  constructor(options: ObjectStorageOptions) {
    this.getDestination = options.destination || getDefaultDestination;
    this.getFileName = options.filename || getDefaultFileName;
    this.getResize = options.resize || getDefaultResize;
    this.getBucket = options.bucket || getDefaultBucket;
  }

  _handleFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error, file?: CallbackObject) => void,
  ) {
    const obj: ProcessObject = {};

    promisify(this.getDestination, req, file)
      .then((destination: string) => {
        obj.destination = destination;
        return promisify(this.getFileName, req, file);
      })
      .then((fileName: string) => {
        obj.fileName = fileName;
        return promisify(this.getResize, req, file);
      })
      .then((resize: ObjectResizeOptions) => {
        obj.resize = resize;
        return promisify(this.getBucket, req, file);
      })
      .then((bucket: ObjectBucketOptions) => {
        obj.bucket = bucket;

        // validate
        if (!obj.destination && !obj.bucket) {
          cb(new Error('No destination or bucket information'));
          return false;
        }

        // check file type
        if (!imageMimeTypes.includes(file.mimetype)) {
          // non-image file
          storeFileStream(file.stream, {
            destination: obj.destination,
            fileName: obj.fileName,
            bucket: obj.bucket,
            mimeType: file.mimetype,
          })
            .then((value) => {
              cb(null, getCallbackObject(obj, value));
            })
            .catch(cb);
        } else {
          // image file

          // setup stream & promises
          const infoStream = sharp({
            failOnError: true,
          });
          const mainStream = sharp({
            failOnError: true,
          });
          const resizeStream = sharp({
            failOnError: true,
          });
          const promises: Promise<StoreImageResultItem>[] = [];

          // get full path
          const fullPath: string = getFullPath(obj.destination, obj.fileName);

          // base process
          promises.push(
            infoStream
              .clone()
              .metadata()
              .then((metadata) => {
                obj.height = metadata.height;
                obj.width = metadata.width;

                return Promise.resolve<StoreImageResultItem>({
                  type: 'info',
                  size: metadata.size,
                  width: metadata.width,
                  height: metadata.height,
                });
              }),
          );

          // infoStream.on('info', (info) => {})
          // info: { format, width, height, channel, size, premultiplied }

          // main
          promises.push(
            storeSharpStream(mainStream.clone(), {
              fullPath,
              bucket: obj.bucket,
              mimeType: file.mimetype,
              key: obj.fileName,
            }).then((result) => {
              return Promise.resolve<StoreImageResultItem>({
                type: 'file',
                category: 'original',
                fileName: obj.fileName,
                path: result.path,
                url: result.url,
              });
            }),
          );

          // resize
          if (obj.resize && obj.resize.mimeTypes.includes(file.mimetype)) {
            for (const opt of obj.resize.options) {
              const { fileNameTail = null, ...resizeOptions } = opt;
              let resizeFullPath = null;
              const resizeFileKey = getResizeFullPath(
                obj.fileName,
                resizeOptions,
                fileNameTail,
              );

              if (fullPath) {
                resizeFullPath = getResizeFullPath(
                  fullPath,
                  resizeOptions,
                  fileNameTail,
                );
              }

              promises.push(
                storeSharpStream(resizeStream.clone().resize(resizeOptions), {
                  fullPath: resizeFullPath,
                  bucket: obj.bucket,
                  mimeType: file.mimetype,
                  key: resizeFileKey,
                }).then((result) => {
                  return Promise.resolve<StoreImageResultItem>({
                    type: 'file',
                    category: 'resize',
                    fileName: resizeFileKey,
                    path: result.path,
                    url: result.url,
                    width: resizeOptions.width || null,
                    height: resizeOptions.height || null,
                  });
                }),
              );
            }
          }

          // stream pipeline
          file.stream.pipe(infoStream).pipe(mainStream).pipe(resizeStream);

          // @TODO promise all
          Promise.allSettled(promises)
            .then((results) => {
              cb(null, getCallbackObjectFromResize(obj, results));
            })
            .catch((err) => {
              cb(err);
            });
        }
      })
      .catch((err) => {
        cb(err);
      });
  }

  _removeFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error, file?: any) => void,
  ) {
    unlink(file.path, cb);
  }
}

export const objectStorage = (options: ObjectStorageOptions) => {
  return new ObjectStorage(options);
};

export interface ObjectStorageFile {
  destination: string;
  filename: string;
  size: number;
  path: string;
  url: string;
  width?: number;
  height?: number;
  resize?: CallbackResizeObject[];
}
