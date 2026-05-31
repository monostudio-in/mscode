import { URI } from "../../../../base/common/uri.js";
import { ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { Range } from "../../../../editor/common/core/range.js";
import type { ITextModel } from "../../../../editor/common/model.js";
import type { SearchConfiguration } from "./constants.js";
import { SearchSortOrder } from "../../../services/search/common/search.js";
import { ISearchResult } from "../../search/browser/searchTreeModel/searchTreeCommon.js";
export declare const serializeSearchConfiguration: (config: Partial<SearchConfiguration>) => string;
export declare const extractSearchQueryFromModel: (model: ITextModel) => SearchConfiguration;
export declare const defaultSearchConfig: () => SearchConfiguration;
export declare const extractSearchQueryFromLines: (lines: string[]) => SearchConfiguration;
export declare const serializeSearchResultForEditor: (searchResult: ISearchResult, rawIncludePattern: string, rawExcludePattern: string, contextLines: number, labelFormatter: (x: URI) => string, sortOrder: SearchSortOrder, limitHit?: boolean) => {
    matchRanges: Range[];
    text: string;
    config: Partial<SearchConfiguration>;
};
export declare const parseSavedSearchEditor: (accessor: ServicesAccessor, resource: URI) => Promise<{
    config: SearchConfiguration;
    text: string;
}>;
export declare const parseSerializedSearchEditor: (text: string) => {
    config: SearchConfiguration;
    text: string;
};
