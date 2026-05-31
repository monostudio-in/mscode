import { IExtension } from "./extensions.js";
export declare const IBuiltinExtensionsScannerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IBuiltinExtensionsScannerService>;
export interface IBuiltinExtensionsScannerService {
    readonly _serviceBrand: undefined;
    scanBuiltinExtensions(): Promise<IExtension[]>;
}
