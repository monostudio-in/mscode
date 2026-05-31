import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { InstallOptions } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensionManagement/common/extensionManagement";
import { IExtensionManagementService } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensionManagement/common/extensionManagement.service";
import { IExtensionGalleryService } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensionManagement/common/extensionManagement.service";
import { IExtensionManifest } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { ILogger } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log";
import { IProductService } from "@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service";
export declare class ExtensionManagementCLI {
    private readonly extensionsForceVersionByQuality;
    protected readonly logger: ILogger;
    private readonly extensionManagementService;
    private readonly extensionGalleryService;
    private readonly productService;
    constructor(extensionsForceVersionByQuality: readonly string[], logger: ILogger, extensionManagementService: IExtensionManagementService, extensionGalleryService: IExtensionGalleryService, productService: IProductService);
    protected get location(): string | undefined;
    listExtensions(showVersions: boolean, category?: string, profileLocation?: URI): Promise<void>;
    installExtensions(extensions: (string | URI)[], builtinExtensions: (string | URI)[], installOptions: InstallOptions, force: boolean): Promise<void>;
    updateExtensions(profileLocation?: URI): Promise<void>;
    private installGalleryExtensions;
    private installVSIX;
    private getGalleryExtensions;
    protected validateExtensionKind(_manifest: IExtensionManifest): boolean;
    private validateVSIX;
    uninstallExtensions(extensions: (string | URI)[], force: boolean, profileLocation?: URI): Promise<void>;
    locateExtension(extensions: string[]): Promise<void>;
    private notInstalled;
    private validateBuiltinExtensionEnabledWithAutoUpdates;
}
