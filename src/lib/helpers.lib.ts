import * as short from 'short-uuid';
import { join as pathJoin } from 'path';
import {
  CallbackObject,
  CallbackResizeObject,
  ObjectStorageBucket,
  ObjectStorageDestination,
  ObjectStorageFileName,
  ObjectStorageResize,
  ProcessObject,
  StoreFileResult,
  StoreImageResultItem,
} from './types.lib';

export const getDefaultDestination: ObjectStorageDestination = (
  _req,
  _file,
  cb,
) => {
  cb(null, 'uploads/');
};

export const getDefaultFileName: ObjectStorageFileName = (_req, file, cb) => {
  cb(null, short.generate() + file.originalname);
};

export const getDefaultResize: ObjectStorageResize = (_req, _file, cb) => {
  cb(null, null);
};

export const getDefaultBucket: ObjectStorageBucket = (_req, _file, cb) => {
  cb(null, null);
};

export const getFullPath = (destination: string, fileName: string) => {
  if (destination) {
    if (!/^\//.test(destination)) {
      return pathJoin(process.cwd(), destination, fileName);
    } else {
      return pathJoin(destination, fileName);
    }
  }
  return null;
};

export const getResizeFullPath = (
  originalFullPath: string,
  sizeOptions: { width?: number; height?: number },
  customTail: string = null,
) => {
  let tail = '';
  if (!customTail) {
    if (sizeOptions.width) {
      tail += `w${sizeOptions.width}`;
    } else {
      tail += 'wauto';
    }
    if (sizeOptions.height) {
      tail += `h${sizeOptions.height}`;
    } else {
      tail += 'hauto';
    }
  } else {
    tail = customTail;
  }
  const matches = originalFullPath.match(/\.[a-zA-Z0-9]+$/);
  if (matches.length) {
    return (
      originalFullPath.substring(0, originalFullPath.indexOf(matches[0])) +
      tail +
      matches[0]
    );
  }
  return originalFullPath + tail;
};

export const getCallbackObject = (
  processObject: ProcessObject,
  storeResult: StoreFileResult,
): CallbackObject => {
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

export const getCallbackObjectFromResize = (
  processObject: ProcessObject,
  storeResults: PromiseSettledResult<StoreImageResultItem>[],
): CallbackObject => {
  let size = null;
  let width = null;
  let height = null;
  let path = null;
  let url = null;
  const resize: CallbackResizeObject[] = [];

  storeResults.forEach((res) => {
    if (res.status === 'fulfilled') {
      const val = res.value;
      if (val.type === 'info') {
        size = val.size;
        width = val.width;
        height = val.height;
      } else if (val.type === 'file' && val.category === 'original') {
        path = val.path;
        url = val.url;
      } else if (val.type === 'file' && val.category === 'resize') {
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

export const promisify = (fn, ...rest): Promise<any> => {
  return new Promise((resolve, reject) => {
    fn(...rest, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
