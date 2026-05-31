import { IContextViewProvider } from "../../../../base/browser/ui/contextview/contextview.js";
import { IFindInputOptions } from "../../../../base/browser/ui/findinput/findInput.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.service.js";
import { ContextScopedFindInput } from "../../../../platform/history/browser/contextScopedHistoryWidget.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { NotebookFindFilters } from "../../notebook/browser/contrib/find/findFilters.js";
export declare class SearchFindInput extends ContextScopedFindInput {
    readonly contextMenuService: IContextMenuService;
    readonly instantiationService: IInstantiationService;
    readonly filters: NotebookFindFilters;
    private _findFilter;
    private _filterChecked;
    private readonly _onDidChangeAIToggle;
    readonly onDidChangeAIToggle: import("../../../../base/common/event.js").Event<boolean>;
    constructor(container: HTMLElement | null, contextViewProvider: IContextViewProvider, options: IFindInputOptions, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, filters: NotebookFindFilters, filterStartVisiblitity: boolean);
    private _updatePadding;
    set filterVisible(visible: boolean);
    setEnabled(enabled: boolean): void;
    updateFilterStyles(): void;
}
