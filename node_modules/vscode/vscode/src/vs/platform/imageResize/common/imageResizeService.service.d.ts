export declare const IImageResizeService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IImageResizeService>;
export interface IImageResizeService {
    readonly _serviceBrand: undefined;
    /**
    * Resizes an image to a maximum dimension of 768px while maintaining aspect ratio.
    */
    resizeImage(data: Uint8Array | string, mimeType?: string): Promise<Uint8Array>;
}
