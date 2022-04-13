"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStorageError = exports.ObjectStorageErrorCode = exports.imageMimeTypes = void 0;
exports.imageMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
var ObjectStorageErrorCode;
(function (ObjectStorageErrorCode) {
    ObjectStorageErrorCode["STORE_STREAM"] = "store_stream";
    ObjectStorageErrorCode["HANDLE_FILE"] = "handle_file";
    ObjectStorageErrorCode["S3_UPLOAD"] = "s3_upload";
})(ObjectStorageErrorCode = exports.ObjectStorageErrorCode || (exports.ObjectStorageErrorCode = {}));
class ObjectStorageError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
exports.ObjectStorageError = ObjectStorageError;
//# sourceMappingURL=types.lib.js.map