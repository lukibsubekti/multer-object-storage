/// <reference types="multer" />
import { Request } from 'express';
import { CallbackObject, ObjectStorageBucket, ObjectStorageDestination, ObjectStorageFileName, ObjectStorageOptions, ObjectStorageResize, CallbackResizeObject } from './lib/types.lib';
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
export interface ObjectStorageFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    size: number;
    path: string;
    url: string;
    width?: number;
    height?: number;
    resize?: CallbackResizeObject[];
}
