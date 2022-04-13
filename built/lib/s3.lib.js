"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const fs_1 = require("fs");
const client_s3_1 = require("@aws-sdk/client-s3");
const types_lib_1 = require("./types.lib");
const short_uuid_1 = __importDefault(require("short-uuid"));
function getBucketUrl(endpoint, bucketName) {
    const point = endpoint.indexOf('://') + 3;
    return endpoint.slice(0, point) + bucketName + '.' + endpoint.slice(point);
}
function upload(pathOrStream, { name, endpoint, accessKeyId, secretAccessKey }, fileOptions) {
    const client = new client_s3_1.S3Client({
        endpoint,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
    return new Promise((resolve, reject) => {
        new Promise((streamResolve, streamReject) => {
            if (typeof pathOrStream === 'string') {
                const stream = (0, fs_1.createReadStream)(pathOrStream);
                stream.on('error', function (err) {
                    streamReject(err);
                });
                streamResolve(stream);
            }
            else if (pathOrStream instanceof Buffer) {
                streamResolve(pathOrStream);
            }
            else {
                const chunks = [];
                const promise = new Promise((bufferResolve, bufferReject) => {
                    pathOrStream.on('error', (err) => {
                        bufferReject(err);
                    });
                    pathOrStream.on('data', (chunk) => {
                        chunks.push(chunk);
                    });
                    pathOrStream.on('end', () => {
                        bufferResolve(Buffer.concat(chunks));
                    });
                });
                promise
                    .then((stream) => {
                    streamResolve(stream);
                })
                    .catch((bufferError) => {
                    streamReject(bufferError);
                });
            }
        }).then((stream) => {
            const input = {
                Bucket: name,
                ACL: 'public-read',
                ContentType: fileOptions.mimeType || 'application/octet-stream',
                Body: stream,
                Key: fileOptions.key || short_uuid_1.default.generate(),
            };
            const command = new client_s3_1.PutObjectCommand(input);
            client
                .send(command)
                .then((response) => {
                if (response &&
                    response.$metadata &&
                    response.$metadata.httpStatusCode === 200) {
                    let size = null;
                    if (stream instanceof fs_1.ReadStream) {
                        size = stream.bytesRead;
                    }
                    else if (stream instanceof Buffer) {
                        size = stream.length;
                    }
                    resolve({
                        key: input.Key,
                        url: new URL(input.Key, getBucketUrl(endpoint, name)).href,
                        size,
                    });
                }
                else {
                    reject(new types_lib_1.ObjectStorageError(types_lib_1.ObjectStorageErrorCode.S3_UPLOAD, 'S3 response tatus code is not 200'));
                }
            })
                .catch((error) => {
                reject(error);
            });
        }).catch((streamError) => {
            reject(streamError);
        });
    });
}
exports.upload = upload;
//# sourceMappingURL=s3.lib.js.map