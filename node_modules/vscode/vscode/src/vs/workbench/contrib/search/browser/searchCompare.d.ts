import { SearchSortOrder } from "../../../services/search/common/search.js";
import { RenderableMatch } from "./searchTreeModel/searchTreeCommon.js";
/**
 * Compares instances of the same match type. Different match types should not be siblings
 * and their sort order is undefined.
 */
export declare function searchMatchComparer(elementA: RenderableMatch, elementB: RenderableMatch, sortOrder?: SearchSortOrder): number;
export declare function searchComparer(elementA: RenderableMatch, elementB: RenderableMatch, sortOrder?: SearchSortOrder): number;
