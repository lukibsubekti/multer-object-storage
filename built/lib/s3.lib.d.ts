/// <reference types="node" />
import { Readable } from 'stream';
import { ObjectBucketOptions } from './types.lib';
export declare function upload(pathOrStream: string | Readable | Buffer, { name, endpoint, accessKeyId, secretAccessKey }: ObjectBucketOptions, fileOptions?: {
    mimeType?: string;
    key?: string;
}): Promise<{
    key: string;
    url: string;
    size?: number;
}>;
