import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from "../../../browser/editorBrowser.js";
import { IPosition } from "../../../common/core/position.js";
import { CodeActionSet, CodeActionTrigger } from "../common/types.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
export interface LightBulbInfo {
    readonly actions: CodeActionSet;
    readonly trigger: CodeActionTrigger;
    readonly icon: ThemeIcon;
    readonly autoRun: boolean;
    readonly title: string;
    readonly isGutter: boolean;
}
export declare function computeLightBulbInfo(actions: CodeActionSet, trigger: CodeActionTrigger, preferredKbLabel: string | undefined, quickFixKbLabel: string | undefined, forGutter?: boolean): LightBulbInfo | undefined;
export declare class LightBulbWidget extends Disposable implements IContentWidget {
    private readonly _editor;
    private readonly _keybindingService;
    private _gutterDecorationID;
    onlyWithEmptySelection: boolean;
    private static readonly GUTTER_DECORATION;
    static readonly ID = "editor.contrib.lightbulbWidget";
    private static readonly _posPref;
    private readonly _domNode;
    private readonly _onClick;
    readonly onClick: Event<{
        readonly x: number;
        readonly y: number;
        readonly actions: CodeActionSet;
        readonly trigger: CodeActionTrigger;
    }>;
    private readonly _state;
    private readonly _gutterState;
    private readonly _combinedInfo;
    readonly lightBulbInfo: IObservable<LightBulbInfo | undefined>;
    private _iconClasses;
    private readonly lightbulbClasses;
    private readonly _preferredKbLabel;
    private readonly _quickFixKbLabel;
    private gutterDecoration;
    private static _computeLightBulbInfo;
    constructor(_editor: ICodeEditor, _keybindingService: IKeybindingService);
    dispose(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    update(actions: CodeActionSet, trigger: CodeActionTrigger, atPosition: IPosition): void;
    hide(): void;
    gutterHide(): void;
    private _updateLightBulbTitleAndIcon;
    private _updateGutterDecorationOptions;
    private renderGutterLightbub;
    private _addGutterDecoration;
    private _removeGutterDecoration;
    private _updateGutterDecoration;
}
