/// <reference types="multer" />
import { Request } from 'express';
import { CallbackObject, ObjectStorageBucket, ObjectStorageDestination, ObjectStorageFileName, ObjectStorageOptions, ObjectStorageResize } from './lib/types.lib';
export declare class ObjectStorage {
    getDestination: ObjectStorageDestination;
    getFileName: ObjectStorageFileName;
    getResize: ObjectStorageResize;
    getBucket: ObjectStorageBucket;
    constructor(options: ObjectStorageOptions);
    _handleFile(req: Request, file: Express.Multer.File, cb: (error: Error, file?: CallbackObject) => void): void;
    _removeFile(req: Request, file: Express.Multer.File, cb: (error: Error, file?: any) => void): void;
}
export declare const objectStorage: (options: ObjectStorageOptions) => ObjectStorage;
export declare type ObjectStorageFile = CallbackObject;
