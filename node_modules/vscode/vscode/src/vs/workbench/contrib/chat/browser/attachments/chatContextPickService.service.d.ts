import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { IChatContextValueItem, IChatContextPickerItem } from "./chatContextPickService.js";
export interface IChatContextPickService {
    _serviceBrand: undefined;
    items: Iterable<IChatContextValueItem | IChatContextPickerItem>;
    /**
    * Register a value or  picker to the "Add Context" flow. A value directly resolved to a
    * chat attachment and a picker first shows a list of items to pick from and then
    * resolves the selected item to a chat attachment.
    */
    registerChatContextItem(item: IChatContextValueItem | IChatContextPickerItem): IDisposable;
}
export declare const IChatContextPickService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatContextPickService>;
