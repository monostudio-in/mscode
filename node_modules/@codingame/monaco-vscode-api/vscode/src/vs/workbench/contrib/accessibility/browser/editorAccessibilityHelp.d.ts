import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
export declare class EditorAccessibilityHelpContribution extends Disposable {
    static ID: "editorAccessibilityHelpContribution";
    constructor();
}
export declare function getCommentCommandInfo(keybindingService: IKeybindingService, contextKeyService: IContextKeyService, editor: ICodeEditor): string | undefined;
export declare function getChatCommandInfo(keybindingService: IKeybindingService, contextKeyService: IContextKeyService): string | undefined;
export declare function getChatEditInfo(keybindingService: IKeybindingService, contextKeyService: IContextKeyService, editor: ICodeEditor): string | undefined;
