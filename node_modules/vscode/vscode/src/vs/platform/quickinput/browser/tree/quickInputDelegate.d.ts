import { IListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { IQuickTreeItem } from "../../common/quickInput.js";
/**
 * Delegate for QuickInputTree that provides height and template information.
 */
export declare class QuickInputTreeDelegate<T extends IQuickTreeItem> implements IListVirtualDelegate<T> {
    getHeight(_element: T): number;
    getTemplateId(_element: T): string;
}
