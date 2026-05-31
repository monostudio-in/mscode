import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { IFileService } from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service";
import { IProductService } from "@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service";
import { IStorageService } from "@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service";
import { IEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { IConfigurationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service";
import { AbstractExtensionResourceLoaderService } from "../common/extensionResourceLoader.js";
import { IExtensionGalleryManifestService } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensionManagement/common/extensionGalleryManifest.service";
export declare class ExtensionResourceLoaderService extends AbstractExtensionResourceLoaderService {
    readonly _serviceBrand: undefined;
    constructor(fileService: IFileService, storageService: IStorageService, productService: IProductService, environmentService: IEnvironmentService, configurationService: IConfigurationService, extensionGalleryManifestService: IExtensionGalleryManifestService, logService: ILogService);
    readExtensionResource(uri: URI): Promise<string>;
}
