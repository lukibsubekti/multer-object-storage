"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeSharpStream = exports.storeFileStream = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const types_lib_1 = require("./types.lib");
const helpers_lib_1 = require("./helpers.lib");
const s3_lib_1 = require("./s3.lib");
function createFileFromReadable(stream, destination, fileName) {
    return new Promise((resolve, reject) => {
        // use create read stream
        const fullPath = (0, helpers_lib_1.getFullPath)(destination, fileName);
        const outStream = (0, fs_1.createWriteStream)(fullPath);
        outStream.on('error', (err) => {
            reject(err);
        });
        outStream.on('finish', () => {
            resolve({
                fileName: fileName,
                size: outStream.bytesWritten,
                path: fullPath,
            });
        });
        stream.pipe(outStream);
    });
}
function storeFileStream(stream, options = {}) {
    const { destination = null, fileName = null, bucket = null, mimeType = null, } = options;
    return new Promise((resolve, reject) => {
        if (fileName === null) {
            reject(new types_lib_1.ObjectStorageError(types_lib_1.ObjectStorageErrorCode.STORE_STREAM, '"options.fileName" must be set.'));
            return false;
        }
        if (destination === null && bucket === null) {
            reject(new types_lib_1.ObjectStorageError(types_lib_1.ObjectStorageErrorCode.STORE_STREAM, 'Either "options.destination" or "options.bucket" must be set.'));
            return false;
        }
        // if disk store only
        if (destination && bucket === null) {
            createFileFromReadable(stream, destination, fileName)
                .then((value) => {
                resolve(value);
            })
                .catch(reject);
        }
        else if (bucket && destination === null) { // if bucket store only
            (0, s3_lib_1.upload)(stream, bucket, { mimeType, key: fileName })
                .then((value) => {
                resolve({
                    fileName: value.key,
                    size: value.size || null,
                    url: value.url,
                });
            })
                .catch(reject);
        }
        else { // if disk and bucket store
            let createFileValue;
            createFileFromReadable(stream, destination, fileName)
                .then((value) => {
                createFileValue = value;
                return (0, s3_lib_1.upload)(value.path, bucket, { mimeType, key: fileName });
            })
                .then((value) => {
                resolve(Object.assign(Object.assign({}, createFileValue), { url: value.url }));
            })
                .catch(reject);
        }
    });
}
exports.storeFileStream = storeFileStream;
function storeSharpStream(stream, { fullPath, bucket, mimeType, key, }) {
    if (fullPath && bucket) {
        return stream
            .toFile(fullPath)
            .then(() => {
            return (0, s3_lib_1.upload)(fullPath, bucket, {
                mimeType,
                key: key || (0, path_1.basename)(fullPath),
            });
        })
            .then((uploadResult) => {
            return Object.assign(Object.assign({}, uploadResult), { path: fullPath });
        });
    }
    else if (fullPath) {
        return stream.toFile(fullPath).then(() => {
            return {
                path: fullPath,
                url: null,
            };
        });
    }
    else if (bucket) {
        return stream
            .toBuffer()
            .then((buffer) => {
            return (0, s3_lib_1.upload)(buffer, bucket, {
                mimeType,
                key,
            });
        })
            .then((uploadResult) => {
            return Object.assign(Object.assign({}, uploadResult), { path: null });
        });
    }
    else {
        throw new types_lib_1.ObjectStorageError(types_lib_1.ObjectStorageErrorCode.STORE_STREAM, 'Either fullPath or bucket must be provided.');
    }
}
exports.storeSharpStream = storeSharpStream;
//# sourceMappingURL=store.lib.js.map