import { ISearchTreeFileMatch } from "../searchTreeModel/searchTreeCommon.js";
import { Range } from "../../../../../editor/common/core/range.js";
export interface ISearchTreeAIFileMatch extends ISearchTreeFileMatch {
    getFullRange(): Range | undefined;
    readonly rank: number;
}
export declare function isSearchTreeAIFileMatch(obj: any): obj is ISearchTreeAIFileMatch;
