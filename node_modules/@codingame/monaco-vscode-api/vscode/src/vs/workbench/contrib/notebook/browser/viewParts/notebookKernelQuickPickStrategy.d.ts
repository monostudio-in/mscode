import { IAction } from "../../../../../base/common/actions.js";
import { Command } from "../../../../../editor/common/languages.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.service.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.service.js";
import { ILabelService } from "../../../../../platform/label/common/label.service.js";
import { ILogService } from "../../../../../platform/log/common/log.service.js";
import { IProductService } from "../../../../../platform/product/common/productService.service.js";
import { IQuickPickItem, QuickPickInput } from "../../../../../platform/quickinput/common/quickInput.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.service.js";
import { IExtensionsWorkbenchService } from "../../../extensions/common/extensions.service.js";
import { IActiveNotebookEditor } from "../notebookBrowser.js";
import { NotebookEditorWidget } from "../notebookEditorWidget.js";
import { NotebookTextModel } from "@codingame/monaco-vscode-notebook-service-override/vscode/vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { INotebookKernel, INotebookKernelMatchResult, ISourceAction } from "../../common/notebookKernelService.js";
import { INotebookKernelHistoryService } from "../../common/notebookKernelService.service.js";
import { INotebookKernelService } from "../../common/notebookKernelService.service.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.service.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.service.js";
import { INotebookTextModel } from "../../common/notebookCommon.js";
import { IExtensionManagementServerService } from "../../../../services/extensionManagement/common/extensionManagement.service.js";
type KernelPick = IQuickPickItem & {
    kernel: INotebookKernel;
};
type GroupedKernelsPick = IQuickPickItem & {
    kernels: INotebookKernel[];
    source: string;
};
type SourcePick = IQuickPickItem & {
    action: ISourceAction;
};
type InstallExtensionPick = IQuickPickItem & {
    extensionIds: string[];
};
type SearchMarketplacePick = IQuickPickItem & {
    id: "install";
};
type KernelSourceQuickPickItem = IQuickPickItem & {
    command: Command;
    documentation?: string;
};
type KernelQuickPickItem = (IQuickPickItem & {
    autoRun?: boolean;
}) | SearchMarketplacePick | InstallExtensionPick | KernelPick | GroupedKernelsPick | SourcePick | KernelSourceQuickPickItem;
export type KernelQuickPickContext = {
    id: string;
    extension: string;
} | {
    notebookEditorId: string;
} | {
    id: string;
    extension: string;
    notebookEditorId: string;
} | {
    ui?: boolean;
    notebookEditor?: NotebookEditorWidget;
    skipIfAlreadySelected?: boolean;
};
export interface IKernelPickerStrategy {
    showQuickPick(editor: IActiveNotebookEditor, wantedKernelId?: string): Promise<boolean>;
}
declare abstract class KernelPickerStrategyBase implements IKernelPickerStrategy {
    protected readonly _notebookKernelService: INotebookKernelService;
    protected readonly _productService: IProductService;
    protected readonly _quickInputService: IQuickInputService;
    protected readonly _labelService: ILabelService;
    protected readonly _logService: ILogService;
    protected readonly _extensionWorkbenchService: IExtensionsWorkbenchService;
    protected readonly _extensionService: IExtensionService;
    protected readonly _commandService: ICommandService;
    protected readonly _extensionManagementServerService: IExtensionManagementServerService;
    constructor(_notebookKernelService: INotebookKernelService, _productService: IProductService, _quickInputService: IQuickInputService, _labelService: ILabelService, _logService: ILogService, _extensionWorkbenchService: IExtensionsWorkbenchService, _extensionService: IExtensionService, _commandService: ICommandService, _extensionManagementServerService: IExtensionManagementServerService);
    showQuickPick(editor: IActiveNotebookEditor, wantedId?: string, skipAutoRun?: boolean): Promise<boolean>;
    protected _getMatchingResult(notebook: NotebookTextModel): INotebookKernelMatchResult;
    protected abstract _getKernelPickerQuickPickItems(notebookTextModel: NotebookTextModel, matchResult: INotebookKernelMatchResult, notebookKernelService: INotebookKernelService, scopedContextKeyService: IContextKeyService): QuickPickInput<KernelQuickPickItem>[];
    protected _handleQuickPick(editor: IActiveNotebookEditor, pick: KernelQuickPickItem, quickPickItems: KernelQuickPickItem[]): Promise<boolean>;
    protected _selecteKernel(notebook: NotebookTextModel, kernel: INotebookKernel): void;
    protected _showKernelExtension(extensionWorkbenchService: IExtensionsWorkbenchService, extensionService: IExtensionService, extensionManagementServerService: IExtensionManagementServerService, viewType: string, extIds: string[], isInsiders?: boolean): Promise<void>;
    private _showInstallKernelExtensionRecommendation;
    protected _getKernelRecommendationsQuickPickItems(notebookTextModel: NotebookTextModel, extensionWorkbenchService: IExtensionsWorkbenchService): Promise<QuickPickInput<SearchMarketplacePick | InstallExtensionPick>[] | undefined>;
    /**
     * Examine the most common language in the notebook
     * @param notebookTextModel The notebook text model
     * @returns What the suggested language is for the notebook. Used for kernal installing
     */
    private getSuggestedLanguage;
    /**
     * Given a language and notebook view type suggest a kernel for installation
     * @param language The language to find a suggested kernel extension for
     * @returns A recommednation object for the recommended extension, else undefined
     */
    private getSuggestedKernelFromLanguage;
}
export declare class KernelPickerMRUStrategy extends KernelPickerStrategyBase {
    private readonly _notebookKernelHistoryService;
    private readonly _openerService;
    constructor(_notebookKernelService: INotebookKernelService, _productService: IProductService, _quickInputService: IQuickInputService, _labelService: ILabelService, _logService: ILogService, _extensionWorkbenchService: IExtensionsWorkbenchService, _extensionService: IExtensionService, _extensionManagementServerService: IExtensionManagementServerService, _commandService: ICommandService, _notebookKernelHistoryService: INotebookKernelHistoryService, _openerService: IOpenerService);
    protected _getKernelPickerQuickPickItems(notebookTextModel: NotebookTextModel, matchResult: INotebookKernelMatchResult, notebookKernelService: INotebookKernelService, scopedContextKeyService: IContextKeyService): QuickPickInput<KernelQuickPickItem>[];
    protected _selecteKernel(notebook: NotebookTextModel, kernel: INotebookKernel): void;
    protected _getMatchingResult(notebook: NotebookTextModel): INotebookKernelMatchResult;
    protected _handleQuickPick(editor: IActiveNotebookEditor, pick: KernelQuickPickItem, items: KernelQuickPickItem[]): Promise<boolean>;
    private displaySelectAnotherQuickPick;
    private _calculdateKernelSources;
    private _selectOneKernel;
    private _executeCommand;
    static updateKernelStatusAction(notebook: NotebookTextModel, action: IAction, notebookKernelService: INotebookKernelService, notebookKernelHistoryService: INotebookKernelHistoryService): void;
    static resolveKernel(notebook: INotebookTextModel, notebookKernelService: INotebookKernelService, notebookKernelHistoryService: INotebookKernelHistoryService, commandService: ICommandService): Promise<INotebookKernel | undefined>;
}
export {};
