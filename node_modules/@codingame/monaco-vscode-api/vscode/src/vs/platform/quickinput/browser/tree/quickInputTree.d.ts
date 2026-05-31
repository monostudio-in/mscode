import { IMatch } from "../../../../base/common/filters.js";
import { IQuickTreeItem } from "../../common/quickInput.js";
import { IObjectTreeElement, ITreeNode } from "../../../../base/browser/ui/tree/tree.js";
export interface IQuickTreeFilterData {
    readonly labelHighlights?: IMatch[];
    readonly descriptionHighlights?: IMatch[];
}
export declare function getParentNodeState(parentChildren: ITreeNode<IQuickTreeItem | null, IQuickTreeFilterData>[] | IObjectTreeElement<IQuickTreeItem>[]): boolean | "mixed";
