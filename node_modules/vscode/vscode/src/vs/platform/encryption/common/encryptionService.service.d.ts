import { ICommonEncryptionService, KnownStorageProvider } from "@codingame/monaco-vscode-secret-storage-service-override/vscode/vs/platform/encryption/common/encryptionService";
export declare const IEncryptionService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IEncryptionService>;
export interface IEncryptionService extends ICommonEncryptionService {
    setUsePlainTextEncryption(): Promise<void>;
    getKeyStorageProvider(): Promise<KnownStorageProvider>;
}
export declare const IEncryptionMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IEncryptionMainService>;
export interface IEncryptionMainService extends IEncryptionService {
}
