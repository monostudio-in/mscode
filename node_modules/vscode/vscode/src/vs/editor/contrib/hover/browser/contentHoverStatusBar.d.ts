import { HoverAction } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IEditorHoverAction, IEditorHoverStatusBar } from "./hoverTypes.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.service.js";
export declare class EditorHoverStatusBar extends Disposable implements IEditorHoverStatusBar {
    private readonly _keybindingService;
    private readonly _hoverService;
    readonly hoverElement: HTMLElement;
    readonly actions: HoverAction[];
    private readonly actionsElement;
    private _hasContent;
    get hasContent(): boolean;
    constructor(_keybindingService: IKeybindingService, _hoverService: IHoverService);
    addAction(actionOptions: {
        label: string;
        iconClass?: string;
        run: (target: HTMLElement) => void;
        commandId: string;
    }): IEditorHoverAction;
    append(element: HTMLElement): HTMLElement;
}
