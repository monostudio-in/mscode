import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../../../base/common/observable.js";
import { IContextKeyService } from "../../../../../../../platform/contextkey/common/contextkey.service.js";
import { IKeybindingService } from "../../../../../../../platform/keybinding/common/keybinding.service.js";
import { IThemeService } from "../../../../../../../platform/theme/common/themeService.service.js";
import { ObservableCodeEditor } from "../../../../../../browser/observableCodeEditor.js";
import { Position } from "../../../../../../common/core/position.js";
export declare class JumpToView extends Disposable {
    private readonly _editor;
    private readonly _data;
    private readonly _themeService;
    private readonly _keybindingService;
    private readonly _contextKeyService;
    private readonly _style;
    constructor(_editor: ObservableCodeEditor, options: {
        style: "label" | "cursor";
    }, _data: IObservable<{
        jumpToPosition: Position;
    } | undefined>, _themeService: IThemeService, _keybindingService: IKeybindingService, _contextKeyService: IContextKeyService);
    private readonly _styles;
    private readonly _pos;
    private _getKeybinding;
    private readonly _keybinding;
    private readonly _layout;
    private readonly _blink;
    private readonly _widget;
}
