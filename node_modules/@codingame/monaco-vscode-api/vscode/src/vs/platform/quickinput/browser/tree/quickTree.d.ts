import { Event } from "../../../../base/common/event.js";
import { IReader } from "../../../../base/common/observable.js";
import { IQuickTree, IQuickTreeItem, IQuickTreeItemButtonEvent, QuickInputType, QuickPickFocus } from "../../common/quickInput.js";
import { QuickInput, QuickInputUI } from "../quickInput.js";
export declare class QuickTree<T extends IQuickTreeItem> extends QuickInput implements IQuickTree<T> {
    private static readonly DEFAULT_ARIA_LABEL;
    readonly type = QuickInputType.QuickTree;
    private readonly _value;
    private readonly _ariaLabel;
    private readonly _placeholder;
    private readonly _matchOnDescription;
    private readonly _matchOnLabel;
    private readonly _sortByLabel;
    private readonly _activeItems;
    private readonly _itemTree;
    readonly onDidChangeValue: Event<string>;
    readonly onDidChangeActive: Event<readonly T[]>;
    private readonly _onDidChangeCheckedLeafItems;
    readonly onDidChangeCheckedLeafItems: Event<T[]>;
    private readonly _onDidChangeCheckboxState;
    readonly onDidChangeCheckboxState: Event<T>;
    private readonly _onDidAcceptEmitter;
    readonly onDidAccept: Event<void>;
    constructor(ui: QuickInputUI);
    get value(): string;
    set value(value: string);
    get ariaLabel(): string | undefined;
    set ariaLabel(ariaLabel: string | undefined);
    get placeholder(): string | undefined;
    set placeholder(placeholder: string | undefined);
    get matchOnDescription(): boolean;
    set matchOnDescription(matchOnDescription: boolean);
    get matchOnLabel(): boolean;
    set matchOnLabel(matchOnLabel: boolean);
    get sortByLabel(): boolean;
    set sortByLabel(sortByLabel: boolean);
    get activeItems(): readonly T[];
    set activeItems(activeItems: readonly T[]);
    get itemTree(): ReadonlyArray<Readonly<T>>;
    get onDidTriggerItemButton(): Event<IQuickTreeItemButtonEvent<T>>;
    get checkedLeafItems(): readonly T[];
    setItemTree(itemTree: T[]): void;
    getParent(element: T): T | undefined;
    expand(element: T): void;
    collapse(element: T): void;
    isCollapsed(element: T): boolean;
    focusOnInput(): void;
    reveal(element: T): void;
    show(): void;
    protected update(): void;
    _registerListeners(): void;
    _registerAutoruns(): void;
    registerVisibleAutorun(fn: (reader: IReader) => void): void;
    focus(focus: QuickPickFocus): void;
    /**
     * Programmatically accepts an item. Used internally for keyboard navigation.
     * @param inBackground Whether you are accepting an item in the background and keeping the picker open.
     */
    accept(_inBackground?: boolean): void;
}
