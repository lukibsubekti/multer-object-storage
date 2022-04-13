"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectStorage = exports.ObjectStorage = void 0;
const fs_1 = require("fs");
const sharp_1 = __importDefault(require("sharp"));
const types_lib_1 = require("./lib/types.lib");
const helpers_lib_1 = require("./lib/helpers.lib");
const store_lib_1 = require("./lib/store.lib");
class ObjectStorage {
    constructor(options) {
        this.getDestination = options.destination || helpers_lib_1.getDefaultDestination;
        this.getFileName = options.filename || helpers_lib_1.getDefaultFileName;
        this.getResize = options.resize || helpers_lib_1.getDefaultResize;
        this.getBucket = options.bucket || helpers_lib_1.getDefaultBucket;
    }
    _handleFile(req, file, cb) {
        const obj = {};
        (0, helpers_lib_1.promisify)(this.getDestination, req, file)
            .then((destination) => {
            obj.destination = destination;
            return (0, helpers_lib_1.promisify)(this.getFileName, req, file);
        })
            .then((fileName) => {
            obj.fileName = fileName;
            return (0, helpers_lib_1.promisify)(this.getResize, req, file);
        })
            .then((resize) => {
            obj.resize = resize;
            return (0, helpers_lib_1.promisify)(this.getBucket, req, file);
        })
            .then((bucket) => {
            obj.bucket = bucket;
            // validate
            if (!obj.destination && !obj.bucket) {
                cb(new Error('No destination or bucket information'));
                return false;
            }
            // check file type
            if (!types_lib_1.imageMimeTypes.includes(file.mimetype)) {
                // non-image file
                (0, store_lib_1.storeFileStream)(file.stream, {
                    destination: obj.destination,
                    fileName: obj.fileName,
                    bucket: obj.bucket,
                    mimeType: file.mimetype,
                })
                    .then((value) => {
                    cb(null, (0, helpers_lib_1.getCallbackObject)(obj, value));
                })
                    .catch(cb);
            }
            else {
                // image file
                // setup stream & promises
                const infoStream = (0, sharp_1.default)({
                    failOnError: true,
                });
                const mainStream = (0, sharp_1.default)({
                    failOnError: true,
                });
                const resizeStream = (0, sharp_1.default)({
                    failOnError: true,
                });
                const promises = [];
                // get full path
                const fullPath = (0, helpers_lib_1.getFullPath)(obj.destination, obj.fileName);
                // base process
                promises.push(infoStream
                    .clone()
                    .metadata()
                    .then((metadata) => {
                    obj.height = metadata.height;
                    obj.width = metadata.width;
                    return Promise.resolve({
                        type: 'info',
                        size: metadata.size,
                        width: metadata.width,
                        height: metadata.height,
                    });
                }));
                // infoStream.on('info', (info) => {})
                // info: { format, width, height, channel, size, premultiplied }
                // main
                promises.push((0, store_lib_1.storeSharpStream)(mainStream.clone(), {
                    fullPath,
                    bucket: obj.bucket,
                    mimeType: file.mimetype,
                    key: obj.fileName,
                }).then((result) => {
                    return Promise.resolve({
                        type: 'file',
                        category: 'original',
                        fileName: obj.fileName,
                        path: result.path,
                        url: result.url,
                    });
                }));
                // resize
                if (obj.resize && obj.resize.mimeTypes.includes(file.mimetype)) {
                    for (const opt of obj.resize.options) {
                        const { fileNameTail = null } = opt, resizeOptions = __rest(opt, ["fileNameTail"]);
                        let resizeFullPath = null;
                        const resizeFileKey = (0, helpers_lib_1.getResizeFullPath)(obj.fileName, resizeOptions, fileNameTail);
                        if (fullPath) {
                            resizeFullPath = (0, helpers_lib_1.getResizeFullPath)(fullPath, resizeOptions, fileNameTail);
                        }
                        promises.push((0, store_lib_1.storeSharpStream)(resizeStream.clone().resize(resizeOptions), {
                            fullPath: resizeFullPath,
                            bucket: obj.bucket,
                            mimeType: file.mimetype,
                            key: resizeFileKey,
                        }).then((result) => {
                            return Promise.resolve({
                                type: 'file',
                                category: 'resize',
                                fileName: resizeFileKey,
                                path: result.path,
                                url: result.url,
                                width: resizeOptions.width || null,
                                height: resizeOptions.height || null,
                            });
                        }));
                    }
                }
                // stream pipeline
                file.stream.pipe(infoStream).pipe(mainStream).pipe(resizeStream);
                // @TODO promise all
                Promise.allSettled(promises)
                    .then((results) => {
                    cb(null, (0, helpers_lib_1.getCallbackObjectFromResize)(obj, results));
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
    _removeFile(req, file, cb) {
        (0, fs_1.unlink)(file.path, cb);
    }
}
exports.ObjectStorage = ObjectStorage;
const objectStorage = (options) => {
    return new ObjectStorage(options);
};
exports.objectStorage = objectStorage;
//# sourceMappingURL=index.js.map