import { Event } from "../../../base/common/event.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { MenuId } from "../common/actions.js";
import { IActionViewItemFactory } from "@codingame/monaco-vscode-view-common-service-override/vscode/vs/platform/actions/browser/actionViewItemService";
export declare const IActionViewItemService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IActionViewItemService>;
export interface IActionViewItemService {
    _serviceBrand: undefined;
    readonly onDidChange: Event<MenuId>;
    register(menu: MenuId, submenu: MenuId, provider: IActionViewItemFactory, event?: Event<unknown>): IDisposable;
    register(menu: MenuId, commandId: string, provider: IActionViewItemFactory, event?: Event<unknown>): IDisposable;
    lookUp(menu: MenuId, submenu: MenuId): IActionViewItemFactory | undefined;
    lookUp(menu: MenuId, commandId: string): IActionViewItemFactory | undefined;
}
