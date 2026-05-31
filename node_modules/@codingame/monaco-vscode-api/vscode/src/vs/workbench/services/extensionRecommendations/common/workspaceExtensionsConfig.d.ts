import { Disposable } from "../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../platform/files/common/files.service.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.service.js";
import { IModelService } from "../../../../editor/common/services/model.service.js";
import { ILanguageService } from "../../../../editor/common/languages/language.service.js";
import { IJSONEditingService } from "../../configuration/common/jsonEditing.service.js";
import { IWorkspaceExtensionsConfigService } from "./workspaceExtensionsConfig.service.js";
export declare const EXTENSIONS_CONFIG = ".vscode/extensions.json";
export interface IExtensionsConfigContent {
    recommendations?: string[];
    unwantedRecommendations?: string[];
}
export declare class WorkspaceExtensionsConfigService extends Disposable implements IWorkspaceExtensionsConfigService {
    private readonly workspaceContextService;
    private readonly fileService;
    private readonly quickInputService;
    private readonly modelService;
    private readonly languageService;
    private readonly jsonEditingService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeExtensionsConfigs;
    readonly onDidChangeExtensionsConfigs: import("../../../../base/common/event.js").Event<void>;
    constructor(workspaceContextService: IWorkspaceContextService, fileService: IFileService, quickInputService: IQuickInputService, modelService: IModelService, languageService: ILanguageService, jsonEditingService: IJSONEditingService);
    getExtensionsConfigs(): Promise<IExtensionsConfigContent[]>;
    getRecommendations(): Promise<string[]>;
    getUnwantedRecommendations(): Promise<string[]>;
    toggleRecommendation(extensionId: string): Promise<void>;
    toggleUnwantedRecommendation(extensionId: string): Promise<void>;
    private addOrRemoveWorkspaceFolderRecommendation;
    private addOrRemoveWorkspaceRecommendation;
    private addOrRemoveWorkspaceFolderUnwantedRecommendation;
    private addOrRemoveWorkspaceUnwantedRecommendation;
    private pickWorkspaceOrFolders;
    private resolveWorkspaceExtensionConfig;
    private resolveWorkspaceFolderExtensionConfig;
    private parseExtensionConfig;
    private getEditToRemoveValueFromArray;
}
