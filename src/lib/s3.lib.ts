import { createReadStream, ReadStream } from 'fs';
import { Readable } from 'stream';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  ObjectBucketOptions,
  ObjectStorageError,
  ObjectStorageErrorCode,
} from './types.lib';
import shortUUID from 'short-uuid';

function getBucketUrl(endpoint: string, bucketName: string) {
  const point = endpoint.indexOf('://') + 3;
  return endpoint.slice(0, point) + bucketName + '.' + endpoint.slice(point);
}

export function upload(
  pathOrStream: string | Readable | Buffer,
  { name, endpoint, accessKeyId, secretAccessKey }: ObjectBucketOptions,
  fileOptions?: { mimeType?: string; key?: string },
): Promise<{ key: string; url: string; size?: number }> {
  const client = new S3Client({
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return new Promise((resolve, reject) => {

    new Promise<ReadStream | Buffer>((streamResolve, streamReject) => {

      if (typeof pathOrStream === 'string') {
        const stream = createReadStream(pathOrStream) as ReadStream;
        stream.on('error', function (err) {
          streamReject(err);
        });
        streamResolve(stream);

      } else if (pathOrStream instanceof Buffer) {
        streamResolve(pathOrStream);

      } else {
        const chunks = [];
        const promise: Promise<Buffer> = new Promise((bufferResolve, bufferReject) => {
          (pathOrStream as Readable).on('error', (err) => {
            bufferReject(err);
          });
          (pathOrStream as Readable).on('data', (chunk) => {
            chunks.push(chunk);
          });
          (pathOrStream as Readable).on('end', () => {
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
    }).then((stream: ReadStream | Buffer) => {
      const input = {
        Bucket: name,
        ACL: 'public-read',
        ContentType: fileOptions.mimeType || 'application/octet-stream',
        Body: stream,
        Key: fileOptions.key || shortUUID.generate(),
      };
  
      const command = new PutObjectCommand(input);
      client
        .send(command)
        .then((response) => {
          if (
            response &&
            response.$metadata &&
            response.$metadata.httpStatusCode === 200
          ) {
            let size: number = null;
            if (stream instanceof ReadStream) {
              size = stream.bytesRead;
            } else if (stream instanceof Buffer) {
              size = stream.length;
            }
            resolve({
              key: input.Key,
              url: new URL(input.Key, getBucketUrl(endpoint, name)).href,
              size,
            });
          } else {
            reject(
              new ObjectStorageError(
                ObjectStorageErrorCode.S3_UPLOAD,
                'S3 response tatus code is not 200',
              ),
            );
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
