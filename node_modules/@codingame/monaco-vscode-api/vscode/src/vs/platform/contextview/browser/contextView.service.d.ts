import { IContextMenuDelegate } from "../../../base/browser/contextmenu.js";
import { IContextViewProvider } from "../../../base/browser/ui/contextview/contextview.js";
import { Event } from "../../../base/common/event.js";
import { AnchorAlignment } from "../../../base/common/layout.js";
import { IContextViewDelegate, IOpenContextView, type IContextMenuMenuDelegate } from "./contextView.js";
export declare const IContextViewService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IContextViewService>;
export interface IContextViewService extends IContextViewProvider {
    readonly _serviceBrand: undefined;
    showContextView(delegate: IContextViewDelegate, container?: HTMLElement, shadowRoot?: boolean): IOpenContextView;
    hideContextView(data?: any): void;
    getContextViewElement(): HTMLElement;
    layout(): void;
    anchorAlignment?: AnchorAlignment;
}
export declare const IContextMenuService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IContextMenuService>;
export interface IContextMenuService {
    readonly _serviceBrand: undefined;
    readonly onDidShowContextMenu: Event<void>;
    readonly onDidHideContextMenu: Event<void>;
    showContextMenu(delegate: IContextMenuDelegate | IContextMenuMenuDelegate): void;
}
