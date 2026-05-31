import { WorkbenchCompressibleAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { RenderableMatch, ISearchResult } from "./searchTreeModel/searchTreeCommon.js";
/**
 * Recursively expand all nodes in the search results tree that are a child of `element`
 * If `element` is not provided, it is the root node.
 */
export declare function forcedExpandRecursively(viewer: WorkbenchCompressibleAsyncDataTree<ISearchResult, RenderableMatch, void>, element: RenderableMatch | undefined): Promise<void>;
