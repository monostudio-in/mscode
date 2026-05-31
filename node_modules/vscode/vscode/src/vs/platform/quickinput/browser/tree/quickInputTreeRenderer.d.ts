import { ToolBar } from "../../../../base/browser/ui/toolbar/toolbar.js";
import { IHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegate.js";
import { IconLabel } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import { IToggleStyles, TriStateCheckbox } from "../../../../base/browser/ui/toggle/toggle.js";
import { ITreeElementRenderDetails, ITreeNode, ITreeRenderer } from "../../../../base/browser/ui/tree/tree.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { IContextMenuService } from "../../../contextview/browser/contextView.service.js";
import { IThemeService } from "../../../theme/common/themeService.service.js";
import { IQuickTreeCheckboxEvent, IQuickTreeItem, IQuickTreeItemButtonEvent } from "../../common/quickInput.js";
import { IQuickTreeFilterData } from "./quickInputTree.js";
export interface IQuickTreeTemplateData {
    entry: HTMLElement;
    checkbox: TriStateCheckbox;
    icon: HTMLElement;
    label: IconLabel;
    actionBar: ToolBar;
    toDisposeElement: DisposableStore;
    toDisposeTemplate: DisposableStore;
}
export declare class QuickInputCheckboxStateHandler<T> extends Disposable {
    private readonly _onDidChangeCheckboxState;
    readonly onDidChangeCheckboxState: Event<{
        item: T;
        checked: boolean | "mixed";
    }>;
    setCheckboxState(node: T, checked: boolean | "mixed"): void;
}
export declare class QuickInputTreeRenderer<T extends IQuickTreeItem> extends Disposable implements ITreeRenderer<T, IQuickTreeFilterData, IQuickTreeTemplateData> {
    private readonly _hoverDelegate;
    private readonly _buttonTriggeredEmitter;
    private readonly onCheckedEvent;
    private readonly _checkboxStateHandler;
    private readonly _toggleStyles;
    private readonly _contextMenuService;
    private readonly _themeService;
    static readonly ID = "quickInputTreeElement";
    templateId: string;
    private readonly _onDidDisposeFocusedElement;
    /**
     * This event is emitted when the renderer disposes an element that has focus.
     * This allows the list to re-focus itself and prevent focus from being lost
     * (potentially causing quickinput to dismiss itself) when an element is
     * removed while focused.
     */
    readonly onDidDisposeFocusedElement: Event<void>;
    constructor(_hoverDelegate: IHoverDelegate | undefined, _buttonTriggeredEmitter: Emitter<IQuickTreeItemButtonEvent<T>>, onCheckedEvent: Event<IQuickTreeCheckboxEvent<T>>, _checkboxStateHandler: QuickInputCheckboxStateHandler<T>, _toggleStyles: IToggleStyles, _contextMenuService: IContextMenuService, _themeService: IThemeService);
    renderTemplate(container: HTMLElement): IQuickTreeTemplateData;
    renderElement(node: ITreeNode<T, IQuickTreeFilterData>, _index: number, templateData: IQuickTreeTemplateData, _details?: ITreeElementRenderDetails): void;
    disposeElement(_element: ITreeNode<T, IQuickTreeFilterData>, _index: number, templateData: IQuickTreeTemplateData, _details?: ITreeElementRenderDetails): void;
    disposeTemplate(templateData: IQuickTreeTemplateData): void;
}
