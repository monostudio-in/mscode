import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IPosition } from "../../../common/core/position.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.service.js";
export declare class MessageController implements IEditorContribution {
    private readonly _openerService;
    static readonly ID = "editor.contrib.messageController";
    static readonly MESSAGE_VISIBLE: RawContextKey<boolean>;
    static get(editor: ICodeEditor): MessageController | null;
    private readonly _editor;
    private readonly _visible;
    private readonly _messageWidget;
    private readonly _messageListeners;
    private _mouseOverMessage;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, _openerService: IOpenerService);
    dispose(): void;
    isVisible(): boolean | undefined;
    showMessage(message: IMarkdownString | string, position: IPosition): void;
    closeMessage(): void;
}
