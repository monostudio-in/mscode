import type * as marked from "../../../../base/common/marked/marked.js";
export declare const mathInlineRegExp: RegExp;
export declare const katexContainerClassName = "vscode-katex-container";
export declare const katexContainerLatexAttributeName = "data-latex";
export declare namespace MarkedKatexExtension {
    type KatexOptions = import("katex").KatexOptions;
    export interface MarkedKatexOptions extends KatexOptions {
    }
    export function extension(katex: typeof import("katex").default, options?: MarkedKatexOptions): marked.MarkedExtension;
    export {};
}
