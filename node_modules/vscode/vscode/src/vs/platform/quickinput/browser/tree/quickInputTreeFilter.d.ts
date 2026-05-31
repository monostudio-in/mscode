import { ITreeFilter, ITreeFilterDataResult, TreeVisibility } from "../../../../base/browser/ui/tree/tree.js";
import { IQuickTreeItem } from "../../common/quickInput.js";
import { IQuickTreeFilterData } from "./quickInputTree.js";
export declare class QuickInputTreeFilter implements ITreeFilter<IQuickTreeItem, IQuickTreeFilterData> {
    filterValue: string;
    matchOnLabel: boolean;
    matchOnDescription: boolean;
    filter(element: IQuickTreeItem, parentVisibility: TreeVisibility): ITreeFilterDataResult<IQuickTreeFilterData>;
}
