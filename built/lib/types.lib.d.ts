/// <reference types="multer" />
import { Request } from 'express';
import { ResizeOptions } from 'sharp';
export declare const imageMimeTypes: string[];
/**
 * Function that calls a callback that contains destination information
 */
export declare type ObjectStorageDestination = (req: Request, file: Express.Multer.File, cb: (error: Error, destination: string) => void) => void;
/**
 * Function that calls a callback that contains filename information
 */
export declare type ObjectStorageFileName = (req: Request, file: Express.Multer.File, cb: (error: Error, fileName: string) => void) => void;
/**
 * Function that calls a callback that contains resizing options information
 */
export declare type ObjectStorageResize = (req: Request, file: Express.Multer.File, cb: (error: Error, options: ObjectResizeOptions) => void) => void;
export declare type ObjectStorageBucket = (req: Request, file: Express.Multer.File, cb: (error: Error, options: ObjectBucketOptions) => void) => void;
export declare enum ObjectStorageErrorCode {
    STORE_STREAM = "store_stream",
    HANDLE_FILE = "handle_file",
    S3_UPLOAD = "s3_upload"
}
/**
 * Sharp resize options with additions
 */
declare type AddedResizeOptions = {
    fileNameTail?: string;
} & ResizeOptions;
/**
 * Resizing options
 */
export interface ObjectResizeOptions {
    mimeTypes: string[];
    options: AddedResizeOptions[];
}
/**
 * Bucket options
 */
export interface ObjectBucketOptions {
    name: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
}
/**
 * Constructor properties of the storage engine
 */
export interface ObjectStorageOptions {
    destination?: ObjectStorageDestination;
    filename?: ObjectStorageFileName;
    resize?: ObjectStorageResize;
    bucket?: ObjectStorageBucket;
}
/**
 * Shape of resize property in the callback object
 */
export interface CallbackResizeObject {
    width?: number;
    height?: number;
    url?: string;
    path?: string;
}
/**
 * Callback result value of the storage engine
 */
export interface CallbackObject {
    destination: string;
    filename: string;
    path: string;
    size: number;
    width?: number;
    height?: number;
    url?: string;
    resize?: CallbackResizeObject[];
}
/**
 * Temporary object to maintain process variables
 */
export interface ProcessObject {
    destination?: string;
    fileName?: string;
    width?: number;
    height?: number;
    resize?: ObjectResizeOptions;
    bucket?: ObjectBucketOptions;
}
/**
 * Result of storeFileStream function
 */
export interface StoreFileResult {
    fileName: string;
    size: number;
    path?: string;
    url?: string;
    width?: number;
    height?: number;
    resize?: CallbackResizeObject[];
}
/**
 * Items of the result of storeImageStream function
 */
export interface StoreImageResultItem {
    type: 'file' | 'info';
    category?: 'original' | 'resize';
    size?: number;
    fileName?: string;
    path?: string;
    url?: string;
    width?: number;
    height?: number;
}
export declare class ObjectStorageError extends Error {
    code: ObjectStorageErrorCode;
    constructor(code: ObjectStorageErrorCode, message: string);
}
export {};
