import { LiveElement } from "../../../../../../../base/browser/dom.js";
import { ICommandService } from "../../../../../../../platform/commands/common/commands.service.js";
import { IContextKeyService } from "../../../../../../../platform/contextkey/common/contextkey.service.js";
import { IKeybindingService } from "../../../../../../../platform/keybinding/common/keybinding.service.js";
import { ObservableCodeEditor } from "../../../../../../browser/observableCodeEditor.js";
import { InlineSuggestionGutterMenuData } from "./gutterIndicatorView.js";
export declare class GutterIndicatorMenuContent {
    private readonly _editorObs;
    private readonly _data;
    private readonly _close;
    private readonly _contextKeyService;
    private readonly _keybindingService;
    private readonly _commandService;
    private readonly _inlineEditsShowCollapsed;
    constructor(_editorObs: ObservableCodeEditor, _data: InlineSuggestionGutterMenuData, _close: (focusEditor: boolean, commandId?: string) => void, _contextKeyService: IContextKeyService, _keybindingService: IKeybindingService, _commandService: ICommandService);
    toDisposableLiveElement(): LiveElement;
    private _createHoverContent;
    private _getKeybinding;
}
