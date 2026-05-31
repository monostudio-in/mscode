
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import '@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/extensions';
import { IFileService } from '@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service';
import { FileAccess, Schemas } from '@codingame/monaco-vscode-api/vscode/vs/base/common/network';
import { IProductService } from '@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service';
import { IStorageService } from '@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service';
import { IEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service';
import { ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { IConfigurationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service';
import { AbstractExtensionResourceLoaderService } from '../common/extensionResourceLoader.js';
import '@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation';
import { IExtensionGalleryManifestService } from '@codingame/monaco-vscode-api/vscode/vs/platform/extensionManagement/common/extensionGalleryManifest.service';

let ExtensionResourceLoaderService = class ExtensionResourceLoaderService extends AbstractExtensionResourceLoaderService {
    constructor(
        fileService,
        storageService,
        productService,
        environmentService,
        configurationService,
        extensionGalleryManifestService,
        logService
    ) {
        super(
            fileService,
            storageService,
            productService,
            environmentService,
            configurationService,
            extensionGalleryManifestService,
            logService
        );
    }
    async readExtensionResource(uri) {
        uri = FileAccess.uriToBrowserUri(uri);
        if (uri.scheme !== Schemas.http && uri.scheme !== Schemas.https && uri.scheme !== Schemas.data) {
            const result = await this._fileService.readFile(uri);
            return ( result.value.toString());
        }
        const requestInit = {};
        if (await this.isExtensionGalleryResource(uri)) {
            requestInit.headers = await this.getExtensionGalleryRequestHeaders();
            requestInit.mode = "cors";
        }
        const response = await fetch(( uri.toString(true)), requestInit);
        if (response.status !== 200) {
            this._logService.info(`Request to '${( uri.toString(true))}' failed with status code ${response.status}`);
            throw ( new Error(response.statusText));
        }
        return response.text();
    }
};
ExtensionResourceLoaderService = ( __decorate([( __param(0, IFileService)), ( __param(1, IStorageService)), ( __param(2, IProductService)), ( __param(3, IEnvironmentService)), ( __param(4, IConfigurationService)), ( __param(5, IExtensionGalleryManifestService)), ( __param(6, ILogService))], ExtensionResourceLoaderService));

export { ExtensionResourceLoaderService };
