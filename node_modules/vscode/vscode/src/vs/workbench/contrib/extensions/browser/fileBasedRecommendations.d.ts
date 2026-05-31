import { ExtensionRecommendations, GalleryExtensionRecommendation } from "./extensionRecommendations.js";
import { IExtensionIgnoredRecommendationsService } from "../../../services/extensionRecommendations/common/extensionRecommendations.service.js";
import { IExtensionsWorkbenchService } from "../common/extensions.service.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { IProductService } from "../../../../platform/product/common/productService.service.js";
import { IModelService } from "../../../../editor/common/services/model.service.js";
import { ILanguageService } from "../../../../editor/common/languages/language.service.js";
import { IExtensionRecommendationNotificationService } from "../../../../platform/extensionRecommendations/common/extensionRecommendations.service.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import { IUntitledTextEditorService } from "../../../services/untitled/common/untitledTextEditorService.service.js";
export declare class FileBasedRecommendations extends ExtensionRecommendations {
    private readonly extensionsWorkbenchService;
    private readonly modelService;
    private readonly languageService;
    private readonly storageService;
    private readonly extensionRecommendationNotificationService;
    private readonly extensionIgnoredRecommendationsService;
    private readonly workspaceContextService;
    private readonly untitledTextEditorService;
    private readonly fileOpenRecommendations;
    private readonly recommendationsByPattern;
    private readonly fileBasedRecommendations;
    private readonly fileBasedImportantRecommendations;
    get recommendations(): ReadonlyArray<GalleryExtensionRecommendation>;
    get importantRecommendations(): ReadonlyArray<GalleryExtensionRecommendation>;
    get otherRecommendations(): ReadonlyArray<GalleryExtensionRecommendation>;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, modelService: IModelService, languageService: ILanguageService, productService: IProductService, storageService: IStorageService, extensionRecommendationNotificationService: IExtensionRecommendationNotificationService, extensionIgnoredRecommendationsService: IExtensionIgnoredRecommendationsService, workspaceContextService: IWorkspaceContextService, untitledTextEditorService: IUntitledTextEditorService);
    protected doActivate(): Promise<void>;
    private onModelAdded;
    /**
     * Prompt the user to either install the recommended extension for the file type in the current editor model
     * or prompt to search the marketplace if it has extensions that can support the file type
     */
    private promptImportantRecommendations;
    private promptFromRecommendations;
    private promptRecommendedExtensionForFileType;
    private promptImportantExtensionsInstallNotification;
    private getPromptedRecommendations;
    private addToPromptedRecommendations;
    private filterIgnoredOrNotAllowed;
    private filterInstalled;
    private getCachedRecommendations;
    private storeCachedRecommendations;
}
