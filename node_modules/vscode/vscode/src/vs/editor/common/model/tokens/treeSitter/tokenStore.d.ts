import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { ITextModel } from "../../../model.js";
export declare class ListNode implements IDisposable {
    readonly height: number;
    parent?: ListNode;
    private readonly _children;
    get children(): ReadonlyArray<Node>;
    private _length;
    get length(): number;
    constructor(height: number);
    static create(node1: Node, node2: Node): ListNode;
    canAppendChild(): boolean;
    appendChild(node: Node): void;
    private _updateParentLength;
    unappendChild(): Node;
    prependChild(node: Node): void;
    unprependChild(): Node;
    lastChild(): Node;
    dispose(): void;
}
export declare enum TokenQuality {
    None = 0,
    ViewportGuess = 1,
    EditGuess = 2,
    Accurate = 3
}
type Node = ListNode | LeafNode;
export interface LeafNode {
    readonly length: number;
    token: number;
    tokenQuality: TokenQuality;
    height: 0;
}
export interface TokenUpdate {
    readonly startOffsetInclusive: number;
    readonly length: number;
    readonly token: number;
}
export declare class TokenStore implements IDisposable {
    private readonly _textModel;
    private _root;
    get root(): Node;
    constructor(_textModel: ITextModel);
    private createEmptyRoot;
    /**
     *
     * @param update all the tokens for the document in sequence
     */
    buildStore(tokens: TokenUpdate[], tokenQuality: TokenQuality): void;
    private createFromUpdates;
    /**
     *
     * @param tokens tokens are in sequence in the document.
     */
    update(length: number, tokens: TokenUpdate[], tokenQuality: TokenQuality): void;
    delete(length: number, startOffset: number): void;
    /**
     *
     * @param tokens tokens are in sequence in the document.
     */
    private replace;
    /**
     *
     * @param startOffsetInclusive
     * @param endOffsetExclusive
     * @param visitor Return true from visitor to exit early
     * @returns
     */
    private traverseInOrderInRange;
    getTokenAt(offset: number): TokenUpdate | undefined;
    getTokensInRange(startOffsetInclusive: number, endOffsetExclusive: number): TokenUpdate[];
    markForRefresh(startOffsetInclusive: number, endOffsetExclusive: number): void;
    rangeHasTokens(startOffsetInclusive: number, endOffsetExclusive: number, minimumTokenQuality: TokenQuality): boolean;
    rangeNeedsRefresh(startOffsetInclusive: number, endOffsetExclusive: number): boolean;
    getNeedsRefresh(): {
        startOffset: number;
        endOffset: number;
    }[];
    deepCopy(): TokenStore;
    private _copyNodeIterative;
    /**
     * Returns a string representation of the token tree using an iterative approach
     */
    printTree(root?: Node): string;
    dispose(): void;
}
export {};
