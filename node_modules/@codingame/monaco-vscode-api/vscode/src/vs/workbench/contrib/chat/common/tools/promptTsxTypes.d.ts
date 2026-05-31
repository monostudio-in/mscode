/**
 * This is a subset of the types export from jsonTypes.d.ts in @vscode/prompt-tsx.
 * It's just the types needed to stringify prompt-tsx tool results.
 * It should be kept in sync with the types in that file.
 *
 * Note: do NOT use `declare` with const enums, esbuild doesn't inline them.
 * See https://github.com/evanw/esbuild/issues/4394
 */
export declare enum PromptNodeType {
    Piece = 1,
    Text = 2
}
export interface TextJSON {
    type: PromptNodeType.Text;
    text: string;
    lineBreakBefore: boolean | undefined;
}
/**
 * Constructor kind of the node represented by {@link PieceJSON}. This is
 * less descriptive than the actual constructor, as we only care to preserve
 * the element data that the renderer cares about.
 */
export declare enum PieceCtorKind {
    BaseChatMessage = 1,
    Other = 2,
    ImageChatMessage = 3
}
export interface BasePieceJSON {
    type: PromptNodeType.Piece;
    ctor: PieceCtorKind.BaseChatMessage | PieceCtorKind.Other;
    children: PromptNodeJSON[];
}
export interface ImageChatMessagePieceJSON {
    type: PromptNodeType.Piece;
    ctor: PieceCtorKind.ImageChatMessage;
    children: PromptNodeJSON[];
    props: {
        src: string;
        detail?: "low" | "high";
    };
}
export type PieceJSON = BasePieceJSON | ImageChatMessagePieceJSON;
export type PromptNodeJSON = PieceJSON | TextJSON;
export interface PromptElementJSON {
    node: PieceJSON;
}
export declare function stringifyPromptElementJSON(element: PromptElementJSON): string;
