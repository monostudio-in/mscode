import { IEditorHoverContext, IEditorHoverParticipant, IHoverPart } from "./hoverTypes.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { HoverStartSource } from "./hoverOperation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { ContentHoverResult } from "./contentHoverTypes.js";
import { HoverVerbosityAction } from "../../../common/languages.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.service.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.service.js";
export declare class RenderedContentHover extends Disposable {
    closestMouseDistance: number | undefined;
    initialMousePosX: number | undefined;
    initialMousePosY: number | undefined;
    readonly showAtPosition: Position;
    readonly showAtSecondaryPosition: Position;
    readonly shouldFocus: boolean;
    readonly source: HoverStartSource;
    readonly shouldAppearBeforeContent: boolean;
    private readonly _renderedHoverParts;
    constructor(editor: ICodeEditor, hoverResult: ContentHoverResult, participants: IEditorHoverParticipant<IHoverPart>[], context: IEditorHoverContext, keybindingService: IKeybindingService, hoverService: IHoverService, clipboardService: IClipboardService);
    get domNode(): DocumentFragment;
    get domNodeHasChildren(): boolean;
    get focusedHoverPartIndex(): number;
    get hoverPartsCount(): number;
    focusHoverPartWithIndex(index: number): void;
    getAccessibleWidgetContent(): string;
    getAccessibleWidgetContentAtIndex(index: number): string;
    updateHoverVerbosityLevel(action: HoverVerbosityAction, index: number, focus?: boolean): Promise<void>;
    doesHoverAtIndexSupportVerbosityAction(index: number, action: HoverVerbosityAction): boolean;
    isColorPickerVisible(): boolean;
    static computeHoverPositions(editor: ICodeEditor, anchorRange: Range, hoverParts: IHoverPart[]): {
        showAtPosition: Position;
        showAtSecondaryPosition: Position;
    };
}
