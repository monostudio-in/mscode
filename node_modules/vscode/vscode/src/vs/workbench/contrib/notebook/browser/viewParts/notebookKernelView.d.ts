import { ActionViewItem, IActionViewItemOptions } from "../../../../../base/browser/ui/actionbar/actionViewItems.js";
import { IAction } from "../../../../../base/common/actions.js";
import { Event } from "../../../../../base/common/event.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.service.js";
import { INotebookEditor } from "../notebookBrowser.js";
import { NotebookTextModel } from "@codingame/monaco-vscode-notebook-service-override/vscode/vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { INotebookKernelHistoryService } from "../../common/notebookKernelService.service.js";
import { INotebookKernelService } from "../../common/notebookKernelService.service.js";
export declare class NotebooKernelActionViewItem extends ActionViewItem {
    private readonly _editor;
    private readonly _notebookKernelService;
    private readonly _notebookKernelHistoryService;
    private _kernelLabel?;
    constructor(actualAction: IAction, _editor: {
        onDidChangeModel: Event<void>;
        textModel: NotebookTextModel | undefined;
        scopedContextKeyService?: IContextKeyService;
    } | INotebookEditor, options: IActionViewItemOptions, _notebookKernelService: INotebookKernelService, _notebookKernelHistoryService: INotebookKernelHistoryService);
    render(container: HTMLElement): void;
    protected updateLabel(): void;
    protected _update(): void;
    private _resetAction;
}
