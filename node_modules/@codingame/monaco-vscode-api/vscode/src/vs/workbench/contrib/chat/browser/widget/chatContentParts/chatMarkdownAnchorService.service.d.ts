import { IDisposable } from "../../../../../../base/common/lifecycle.js";
import { InlineAnchorWidget } from "@codingame/monaco-vscode-katex-common/vscode/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatInlineAnchorWidget";
export declare const IChatMarkdownAnchorService: import("../../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatMarkdownAnchorService>;
export interface IChatMarkdownAnchorService {
    readonly _serviceBrand: undefined;
    /**
    * Returns the currently focused anchor if any
    */
    readonly lastFocusedAnchor: InlineAnchorWidget | undefined;
    register(widget: InlineAnchorWidget): IDisposable;
}
