import { Readable } from 'stream';
import { basename } from 'path';
import { createWriteStream } from 'fs';
import { Sharp } from 'sharp';
import {
  ObjectBucketOptions,
  ObjectStorageError,
  ObjectStorageErrorCode,
  StoreFileResult,
} from './types.lib';
import { getFullPath } from './helpers.lib';
import { upload } from './s3.lib';

function createFileFromReadable(
  stream: Readable,
  destination: string,
  fileName: string,
): Promise<{ fileName: string; size: number; path: string }> {
  return new Promise((resolve, reject) => {
    // use create read stream
    const fullPath = getFullPath(destination, fileName);
    const outStream = createWriteStream(fullPath);
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

export function storeFileStream(
  stream: Readable,
  options: {
    destination?: string;
    fileName?: string;
    mimeType?: string;
    bucket?: ObjectBucketOptions;
  } = {},
): Promise<StoreFileResult> {
  const {
    destination = null,
    fileName = null,
    bucket = null,
    mimeType = null,
  } = options;

  return new Promise((resolve, reject) => {
    if (fileName === null) {
      reject(
        new ObjectStorageError(
          ObjectStorageErrorCode.STORE_STREAM,
          '"options.fileName" must be set.',
        ),
      );
      return false;
    }

    if (destination === null && bucket === null) {
      reject(
        new ObjectStorageError(
          ObjectStorageErrorCode.STORE_STREAM,
          'Either "options.destination" or "options.bucket" must be set.',
        ),
      );
      return false;
    }

    // if disk store only
    if (destination && bucket === null) {
      createFileFromReadable(stream, destination, fileName)
        .then((value) => {
          resolve(value);
        })
        .catch(reject);

    } else if (bucket && destination === null) { // if bucket store only
      upload(stream, bucket, { mimeType, key: fileName })
        .then((value) => {
          resolve({
            fileName: value.key,
            size: value.size || null,
            url: value.url,
          });
        })
        .catch(reject);

    } else { // if disk and bucket store
      let createFileValue;
      createFileFromReadable(stream, destination, fileName)
        .then((value) => {
          createFileValue = value;
          return upload(value.path, bucket, { mimeType, key: fileName });
        })
        .then((value) => {
          resolve({
            ...createFileValue,
            url: value.url,
          });
        })
        .catch(reject);
    }
  });
}

export function storeSharpStream(
  stream: Sharp,
  {
    fullPath,
    bucket,
    mimeType,
    key,
  }: {
    fullPath?: string;
    bucket?: ObjectBucketOptions;
    mimeType?: string;
    key?: string;
  },
): Promise<{ url?: string; path?: string }> {
  if (fullPath && bucket) {
    return stream
      .toFile(fullPath)
      .then(() => {
        return upload(fullPath, bucket, {
          mimeType,
          key: key || basename(fullPath),
        });
      })
      .then((uploadResult) => {
        return {
          ...uploadResult,
          path: fullPath,
        };
      });
  } else if (fullPath) {
    return stream.toFile(fullPath).then(() => {
      return {
        path: fullPath,
        url: null,
      };
    });
  } else if (bucket) {
    return stream
      .toBuffer()
      .then((buffer) => {
        return upload(buffer, bucket, {
          mimeType,
          key,
        });
      })
      .then((uploadResult) => {
        return {
          ...uploadResult,
          path: null,
        };
      });
  } else {
    throw new ObjectStorageError(
      ObjectStorageErrorCode.STORE_STREAM,
      'Either fullPath or bucket must be provided.',
    );
  }
}
