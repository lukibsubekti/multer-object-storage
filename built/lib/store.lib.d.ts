/// <reference types="node" />
import { Readable } from 'stream';
import { Sharp } from 'sharp';
import { ObjectBucketOptions, StoreFileResult } from './types.lib';
export declare function storeFileStream(stream: Readable, options?: {
    destination?: string;
    fileName?: string;
    mimeType?: string;
    bucket?: ObjectBucketOptions;
}): Promise<StoreFileResult>;
export declare function storeSharpStream(stream: Sharp, { fullPath, bucket, mimeType, key, }: {
    fullPath?: string;
    bucket?: ObjectBucketOptions;
    mimeType?: string;
    key?: string;
}): Promise<{
    url?: string;
    path?: string;
}>;
