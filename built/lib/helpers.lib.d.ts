import { CallbackObject, ObjectStorageBucket, ObjectStorageDestination, ObjectStorageFileName, ObjectStorageResize, ProcessObject, StoreFileResult, StoreImageResultItem } from './types.lib';
export declare const getDefaultDestination: ObjectStorageDestination;
export declare const getDefaultFileName: ObjectStorageFileName;
export declare const getDefaultResize: ObjectStorageResize;
export declare const getDefaultBucket: ObjectStorageBucket;
export declare const getFullPath: (destination: string, fileName: string) => string;
export declare const getResizeFullPath: (originalFullPath: string, sizeOptions: {
    width?: number;
    height?: number;
}, customTail?: string) => string;
export declare const getCallbackObject: (processObject: ProcessObject, storeResult: StoreFileResult) => CallbackObject;
export declare const getCallbackObjectFromResize: (processObject: ProcessObject, storeResults: PromiseSettledResult<StoreImageResultItem>[]) => CallbackObject;
export declare const promisify: (fn: any, ...rest: any[]) => Promise<any>;
