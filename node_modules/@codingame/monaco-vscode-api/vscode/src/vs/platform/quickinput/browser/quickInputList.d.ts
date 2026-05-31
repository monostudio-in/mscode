import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import { IHoverDelegate } from "../../../base/browser/ui/hover/hoverDelegate.js";
import { IListStyles } from "../../../base/browser/ui/list/listWidget.js";
import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IAccessibilityService } from "../../accessibility/common/accessibility.service.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { IQuickPickItem, IQuickPickItemButtonEvent, IQuickPickSeparatorButtonEvent, QuickPickFocus, QuickPickItem } from "../common/quickInput.js";
import { IQuickInputStyles } from "./quickInput.js";
export declare class QuickInputList extends Disposable {
    private parent;
    private hoverDelegate;
    private linkOpenerDelegate;
    private styles;
    private readonly accessibilityService;
    private readonly _onKeyDown;
    /**
     * Event that is fired when the tree receives a keydown.
    */
    readonly onKeyDown: Event<StandardKeyboardEvent>;
    private readonly _onLeave;
    /**
     * Event that is fired when the tree would no longer have focus.
    */
    readonly onLeave: Event<void>;
    private readonly _visibleCountObservable;
    readonly onChangedVisibleCount: Event<number>;
    private readonly _allVisibleCheckedObservable;
    readonly onChangedAllVisibleChecked: Event<boolean>;
    private readonly _checkedCountObservable;
    readonly onChangedCheckedCount: Event<number>;
    private readonly _checkedElementsObservable;
    readonly onChangedCheckedElements: Event<IQuickPickItem[]>;
    private readonly _onButtonTriggered;
    onButtonTriggered: Event<IQuickPickItemButtonEvent<IQuickPickItem>>;
    private readonly _onSeparatorButtonTriggered;
    onSeparatorButtonTriggered: Event<IQuickPickSeparatorButtonEvent>;
    private readonly _elementChecked;
    private readonly _elementCheckedEventBufferer;
    private _hasCheckboxes;
    private readonly _container;
    private readonly _tree;
    private readonly _separatorRenderer;
    private readonly _itemRenderer;
    private _inputElements;
    private _elementTree;
    private _itemElements;
    private readonly _elementDisposable;
    private _lastHover;
    private _lastQueryString;
    constructor(parent: HTMLElement, hoverDelegate: IHoverDelegate, linkOpenerDelegate: (content: string) => void, id: string, styles: IQuickInputStyles, instantiationService: IInstantiationService, accessibilityService: IAccessibilityService);
    get onDidChangeFocus(): Event<IQuickPickItem[]>;
    get onDidChangeSelection(): Event<{
        items: IQuickPickItem[];
        event: UIEvent | undefined;
    }>;
    get displayed(): boolean;
    set displayed(value: boolean);
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    get ariaLabel(): string | null;
    set ariaLabel(label: string | null);
    set enabled(value: boolean);
    private _matchOnDescription;
    get matchOnDescription(): boolean;
    set matchOnDescription(value: boolean);
    private _matchOnDetail;
    get matchOnDetail(): boolean;
    set matchOnDetail(value: boolean);
    private _matchOnLabel;
    get matchOnLabel(): boolean;
    set matchOnLabel(value: boolean);
    private _matchOnLabelMode;
    get matchOnLabelMode(): "fuzzy" | "contiguous";
    set matchOnLabelMode(value: "fuzzy" | "contiguous");
    private _matchOnMeta;
    get matchOnMeta(): boolean;
    set matchOnMeta(value: boolean);
    private _sortByLabel;
    get sortByLabel(): boolean;
    set sortByLabel(value: boolean);
    private _shouldLoop;
    get shouldLoop(): boolean;
    set shouldLoop(value: boolean);
    private _registerListeners;
    private _registerOnContainerClick;
    private _registerOnMouseMiddleClick;
    private _registerOnTreeModelChanged;
    private _registerOnElementChecked;
    private _registerOnContextMenu;
    private _registerHoverListeners;
    /**
     * Register's focus change and mouse events so that we can track when items inside of a
     * separator's section are focused or hovered so that we can display the separator's actions
     */
    private _registerSeparatorActionShowingListeners;
    private _registerSelectionChangeListener;
    setAllVisibleChecked(checked: boolean): void;
    setElements(inputElements: QuickPickItem[]): void;
    setFocusedElements(items: IQuickPickItem[]): void;
    getActiveDescendant(): string | null;
    setSelectedElements(items: IQuickPickItem[]): void;
    getCheckedElements(): IQuickPickItem[];
    setCheckedElements(items: IQuickPickItem[]): void;
    focus(what: QuickPickFocus): void;
    clearFocus(): void;
    domFocus(): void;
    layout(maxHeight?: number): void;
    filter(query: string): boolean;
    toggleCheckbox(): void;
    style(styles: IListStyles): void;
    toggleHover(): void;
    private _setElementsToTree;
    private _allVisibleChecked;
    private _updateCheckedObservables;
    /**
     * Disposes of the hover and shows a new one for the given index if it has a tooltip.
     * @param element The element to show the hover for
     */
    private showHover;
}
