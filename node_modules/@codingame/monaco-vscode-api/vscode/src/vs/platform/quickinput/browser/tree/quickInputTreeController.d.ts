import { IHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegate.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../instantiation/common/instantiation.js";
import { WorkbenchObjectTree } from "../../../list/browser/listService.js";
import { IQuickTreeCheckboxEvent, IQuickTreeItem, IQuickTreeItemButtonEvent, QuickPickFocus } from "../../common/quickInput.js";
import { IQuickTreeFilterData } from "./quickInputTree.js";
import { QuickInputTreeRenderer } from "./quickInputTreeRenderer.js";
import { IQuickInputStyles } from "../quickInput.js";
export declare class QuickInputTreeController extends Disposable {
    private readonly instantiationService;
    private readonly _renderer;
    private readonly _checkboxStateHandler;
    private readonly _filter;
    private readonly _sorter;
    private readonly _tree;
    private readonly _onDidTriggerButton;
    readonly onDidTriggerButton: Event<IQuickTreeItemButtonEvent<IQuickTreeItem>>;
    private readonly _onDidChangeCheckboxState;
    readonly onDidChangeCheckboxState: Event<IQuickTreeCheckboxEvent<IQuickTreeItem>>;
    private readonly _onDidCheckedLeafItemsChange;
    readonly onDidChangeCheckedLeafItems: Event<readonly IQuickTreeItem[]>;
    private readonly _onLeave;
    /**
     * Event that is fired when the tree would no longer have focus.
    */
    readonly onLeave: Event<void>;
    private readonly _onDidAccept;
    /**
     * Event that is fired when a non-pickable item is clicked, indicating acceptance.
     */
    readonly onDidAccept: Event<void>;
    private readonly _container;
    constructor(container: HTMLElement, hoverDelegate: IHoverDelegate | undefined, styles: IQuickInputStyles, instantiationService: IInstantiationService);
    get tree(): WorkbenchObjectTree<IQuickTreeItem, IQuickTreeFilterData>;
    get renderer(): QuickInputTreeRenderer<IQuickTreeItem>;
    get displayed(): boolean;
    set displayed(value: boolean);
    get sortByLabel(): boolean;
    set sortByLabel(value: boolean);
    getActiveDescendant(): string | null;
    filter(input: string): void;
    updateFilterOptions(options: {
        matchOnLabel?: boolean;
        matchOnDescription?: boolean;
    }): void;
    setTreeData(treeData: readonly IQuickTreeItem[]): void;
    layout(maxHeight?: number): void;
    focus(what: QuickPickFocus): void;
    registerCheckboxStateListeners(): void;
    private updateCheckboxState;
    registerOnDidChangeFocus(): void;
    getCheckedLeafItems(): IQuickTreeItem[];
    getActiveItems(): readonly IQuickTreeItem[];
    toggleCheckbox(): void;
    checkAll(checked: boolean | "mixed"): void;
}
