import { IFileService } from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service";
import { IBrowserWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/browser/environmentService.service";
import { IWorkbenchThemeService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/themes/common/workbenchThemeService.service";
import { IStorageService } from "@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service";
export declare class CSSExtensionPoint {
    private readonly themeService;
    private readonly storageService;
    private readonly disposables;
    private readonly stylesheetsByExtension;
    private readonly pendingExtensions;
    private readonly watcher;
    constructor(fileService: IFileService, environmentService: IBrowserWorkbenchEnvironmentService, themeService: IWorkbenchThemeService, storageService: IStorageService);
    private isExtensionThemeActive;
    private onThemeChange;
    private activateExtensionCSS;
    private removeStylesheets;
    private applyCachedCSS;
    private getCachedCSS;
    private cacheExtensionCSS;
    private clearCacheForExtension;
    private createCSSLinkElement;
    private reloadStylesheet;
    dispose(): void;
}
