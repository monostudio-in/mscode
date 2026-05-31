import type * as TreeSitter from "../../../../../../../../external/@vscode/tree-sitter-wasm/wasm/tree-sitter.js";
export declare function gotoNextSibling(newCursor: TreeSitter.TreeCursor, oldCursor: TreeSitter.TreeCursor): boolean;
export declare function gotoParent(newCursor: TreeSitter.TreeCursor, oldCursor: TreeSitter.TreeCursor): boolean;
export declare function gotoNthChild(newCursor: TreeSitter.TreeCursor, oldCursor: TreeSitter.TreeCursor, index: number): boolean;
export declare function nextSiblingOrParentSibling(newCursor: TreeSitter.TreeCursor, oldCursor: TreeSitter.TreeCursor): boolean;
export declare function getClosestPreviousNodes(cursor: TreeSitter.TreeCursor, tree: TreeSitter.Tree): TreeSitter.Node | undefined;
