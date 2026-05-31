import { ITreeSorter } from "../../../../base/browser/ui/tree/tree.js";
import { IQuickTreeItem } from "../../common/quickInput.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
export declare class QuickInputTreeSorter extends Disposable implements ITreeSorter<IQuickTreeItem> {
    private _sortByLabel;
    get sortByLabel(): boolean;
    set sortByLabel(value: boolean);
    compare(a: IQuickTreeItem, b: IQuickTreeItem): number;
}
