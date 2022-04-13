"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promisify = exports.getCallbackObjectFromResize = exports.getCallbackObject = exports.getResizeFullPath = exports.getFullPath = exports.getDefaultBucket = exports.getDefaultResize = exports.getDefaultFileName = exports.getDefaultDestination = void 0;
const short = __importStar(require("short-uuid"));
const path_1 = require("path");
const getDefaultDestination = (_req, _file, cb) => {
    cb(null, 'uploads/');
};
exports.getDefaultDestination = getDefaultDestination;
const getDefaultFileName = (_req, file, cb) => {
    cb(null, short.generate() + file.originalname);
};
exports.getDefaultFileName = getDefaultFileName;
const getDefaultResize = (_req, _file, cb) => {
    cb(null, null);
};
exports.getDefaultResize = getDefaultResize;
const getDefaultBucket = (_req, _file, cb) => {
    cb(null, null);
};
exports.getDefaultBucket = getDefaultBucket;
const getFullPath = (destination, fileName) => {
    if (destination) {
        if (!/^\//.test(destination)) {
            return (0, path_1.join)(process.cwd(), destination, fileName);
        }
        else {
            return (0, path_1.join)(destination, fileName);
        }
    }
    return null;
};
exports.getFullPath = getFullPath;
const getResizeFullPath = (originalFullPath, sizeOptions, customTail = null) => {
    let tail = '';
    if (!customTail) {
        if (sizeOptions.width) {
            tail += `w${sizeOptions.width}`;
        }
        else {
            tail += 'wauto';
        }
        if (sizeOptions.height) {
            tail += `h${sizeOptions.height}`;
        }
        else {
            tail += 'hauto';
        }
    }
    else {
        tail = customTail;
    }
    const matches = originalFullPath.match(/\.[a-zA-Z0-9]+$/);
    if (matches.length) {
        return (originalFullPath.substring(0, originalFullPath.indexOf(matches[0])) +
            tail +
            matches[0]);
    }
    return originalFullPath + tail;
};
exports.getResizeFullPath = getResizeFullPath;
const getCallbackObject = (processObject, storeResult) => {
    return {
        destination: processObject.destination,
        filename: processObject.fileName,
        path: storeResult.path || null,
        size: storeResult.size || null,
        url: storeResult.url || null,
        width: storeResult.width || null,
        height: storeResult.height || null,
    };
};
exports.getCallbackObject = getCallbackObject;
const getCallbackObjectFromResize = (processObject, storeResults) => {
    let size = null;
    let width = null;
    let height = null;
    let path = null;
    let url = null;
    const resize = [];
    storeResults.forEach((res) => {
        if (res.status === 'fulfilled') {
            const val = res.value;
            if (val.type === 'info') {
                size = val.size;
                width = val.width;
                height = val.height;
            }
            else if (val.type === 'file' && val.category === 'original') {
                path = val.path;
                url = val.url;
            }
            else if (val.type === 'file' && val.category === 'resize') {
                resize.push({
                    path: val.path,
                    url: val.url,
                    width: val.width,
                    height: val.height,
                });
            }
        }
    });
    return {
        destination: processObject.destination,
        filename: processObject.fileName,
        path,
        size,
        url,
        width,
        height,
        resize,
    };
};
exports.getCallbackObjectFromResize = getCallbackObjectFromResize;
const promisify = (fn, ...rest) => {
    return new Promise((resolve, reject) => {
        fn(...rest, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
};
exports.promisify = promisify;
//# sourceMappingURL=helpers.lib.js.map