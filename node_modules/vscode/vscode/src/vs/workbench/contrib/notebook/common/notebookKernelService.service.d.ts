import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { INotebookKernelSourceAction } from "./notebookCommon.js";
import { INotebookKernel, ISelectedNotebooksChangeEvent, INotebookTextModelLike, INotebookKernelMatchResult, INotebookKernelDetectionTask, INotebookSourceActionChangeEvent, ISourceAction, IKernelSourceActionProvider } from "./notebookKernelService.js";
export declare const INotebookKernelService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookKernelService>;
export interface INotebookKernelService {
    _serviceBrand: undefined;
    readonly onDidAddKernel: Event<INotebookKernel>;
    readonly onDidRemoveKernel: Event<INotebookKernel>;
    readonly onDidChangeSelectedNotebooks: Event<ISelectedNotebooksChangeEvent>;
    readonly onDidChangeNotebookAffinity: Event<void>;
    readonly onDidNotebookVariablesUpdate: Event<URI>;
    registerKernel(kernel: INotebookKernel): IDisposable;
    getMatchingKernel(notebook: INotebookTextModelLike): INotebookKernelMatchResult;
    /**
    * Returns the selected or only available kernel.
    */
    getSelectedOrSuggestedKernel(notebook: INotebookTextModelLike): INotebookKernel | undefined;
    /**
    * Bind a notebook document to a kernel. A notebook is only bound to one kernel
    * but a kernel can be bound to many notebooks (depending on its configuration)
    */
    selectKernelForNotebook(kernel: INotebookKernel, notebook: INotebookTextModelLike): void;
    /**
    * Set the kernel that a notebook should use when it starts up
    */
    preselectKernelForNotebook(kernel: INotebookKernel, notebook: INotebookTextModelLike): void;
    /**
    * Set a perference of a kernel for a certain notebook. Higher values win, `undefined` removes the preference
    */
    updateKernelNotebookAffinity(kernel: INotebookKernel, notebook: URI, preference: number | undefined): void;
    readonly onDidChangeKernelDetectionTasks: Event<string>;
    registerNotebookKernelDetectionTask(task: INotebookKernelDetectionTask): IDisposable;
    getKernelDetectionTasks(notebook: INotebookTextModelLike): INotebookKernelDetectionTask[];
    readonly onDidChangeSourceActions: Event<INotebookSourceActionChangeEvent>;
    getSourceActions(notebook: INotebookTextModelLike, contextKeyService: IContextKeyService | undefined): ISourceAction[];
    getRunningSourceActions(notebook: INotebookTextModelLike): ISourceAction[];
    registerKernelSourceActionProvider(viewType: string, provider: IKernelSourceActionProvider): IDisposable;
    getKernelSourceActions2(notebook: INotebookTextModelLike): Promise<INotebookKernelSourceAction[]>;
    notifyVariablesChange(notebookUri: URI): void;
}
export declare const INotebookKernelHistoryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookKernelHistoryService>;
export interface INotebookKernelHistoryService {
    _serviceBrand: undefined;
    getKernels(notebook: INotebookTextModelLike): {
        selected: INotebookKernel | undefined;
        all: INotebookKernel[];
    };
    addMostRecentKernel(kernel: INotebookKernel): void;
}
