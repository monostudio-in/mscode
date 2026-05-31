import { IMouseEvent } from "../../../../../../base/browser/mouseEvent.js";
import { Event } from "../../../../../../base/common/event.js";
import { IObservable } from "../../../../../../base/common/observable.js";
export declare enum InlineEditTabAction {
    Jump = "jump",
    Accept = "accept",
    Inactive = "inactive"
}
export declare class InlineEditClickEvent {
    readonly event: IMouseEvent;
    readonly alternativeAction: boolean;
    static create(event: PointerEvent | MouseEvent, alternativeAction?: boolean): InlineEditClickEvent;
    constructor(event: IMouseEvent, alternativeAction?: boolean);
}
export interface IInlineEditsView {
    isHovered: IObservable<boolean>;
    minEditorScrollHeight?: IObservable<number>;
    readonly onDidClick: Event<InlineEditClickEvent>;
}
export declare enum InlineCompletionViewKind {
    GhostText = "ghostText",
    Custom = "custom",
    SideBySide = "sideBySide",
    Deletion = "deletion",
    InsertionInline = "insertionInline",
    InsertionMultiLine = "insertionMultiLine",
    WordReplacements = "wordReplacements",
    LineReplacement = "lineReplacement",
    Collapsed = "collapsed",
    JumpTo = "jumpTo"
}
export declare class InlineCompletionViewData {
    readonly cursorColumnDistance: number;
    readonly cursorLineDistance: number;
    readonly lineCountOriginal: number;
    readonly lineCountModified: number;
    readonly characterCountOriginal: number;
    readonly characterCountModified: number;
    readonly disjointReplacements: number;
    readonly sameShapeReplacements?: boolean | undefined;
    longDistanceHintVisible: boolean | undefined;
    longDistanceHintDistance: number | undefined;
    constructor(cursorColumnDistance: number, cursorLineDistance: number, lineCountOriginal: number, lineCountModified: number, characterCountOriginal: number, characterCountModified: number, disjointReplacements: number, sameShapeReplacements?: boolean | undefined);
    setLongDistanceViewData(lineNumber: number, inlineEditLineNumber: number): void;
    getData(): {
        cursorColumnDistance: number;
        cursorLineDistance: number;
        lineCountOriginal: number;
        lineCountModified: number;
        characterCountOriginal: number;
        characterCountModified: number;
        disjointReplacements: number;
        sameShapeReplacements: boolean | undefined;
        longDistanceHintVisible: boolean | undefined;
        longDistanceHintDistance: number | undefined;
    };
}
