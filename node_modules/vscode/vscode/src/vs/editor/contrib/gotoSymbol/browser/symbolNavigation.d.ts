import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.service.js";
import { OneReference } from "./referencesModel.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { ISymbolNavigationService } from "./symbolNavigation.service.js";
export declare const ctxHasSymbols: RawContextKey<false>;
export declare class SymbolNavigationService implements ISymbolNavigationService {
    private readonly _editorService;
    private readonly _notificationService;
    private readonly _keybindingService;
    readonly _serviceBrand: undefined;
    private readonly _ctxHasSymbols;
    private _currentModel?;
    private _currentIdx;
    private _currentState?;
    private _currentMessage?;
    private _ignoreEditorChange;
    constructor(contextKeyService: IContextKeyService, _editorService: ICodeEditorService, _notificationService: INotificationService, _keybindingService: IKeybindingService);
    reset(): void;
    put(anchor: OneReference): void;
    revealNext(source: ICodeEditor): Promise<any>;
    private _showMessage;
}
