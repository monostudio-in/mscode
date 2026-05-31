import { DisposableStore } from "../../../../../../../base/common/lifecycle.js";
import { DebugLocation, IObservable, IReader } from "../../../../../../../base/common/observable.js";
import { URI } from "../../../../../../../base/common/uri.js";
import { MenuEntryActionViewItem } from "../../../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { ICodeEditor } from "../../../../../../browser/editorBrowser.js";
import { ObservableCodeEditor } from "../../../../../../browser/observableCodeEditor.js";
import { Point } from "../../../../../../common/core/2d/point.js";
import { Rect } from "../../../../../../common/core/2d/rect.js";
import { LineRange } from "../../../../../../common/core/ranges/lineRange.js";
import { Position } from "../../../../../../common/core/position.js";
import { Range } from "../../../../../../common/core/range.js";
import { TextEdit } from "../../../../../../common/core/edits/textEdit.js";
import { RangeMapping } from "../../../../../../common/diff/rangeMapping.js";
import { ITextModel } from "../../../../../../common/model.js";
import { Size2D } from "../../../../../../common/core/2d/size.js";
/**
 * Warning: might return 0.
*/
export declare function maxContentWidthInRange(editor: ObservableCodeEditor, range: LineRange, reader: IReader | undefined): number;
export declare function getContentSizeOfLines(editor: ObservableCodeEditor, range: LineRange, reader: IReader | undefined): Size2D[];
export declare function getOffsetForPos(editor: ObservableCodeEditor, pos: Position, reader: IReader): number;
export declare function getPrefixTrim(diffRanges: Range[], originalLinesRange: LineRange, modifiedLines: string[], editor: ICodeEditor, reader?: IReader | undefined): {
    prefixTrim: number;
    prefixLeftOffset: number;
};
export declare function getContentRenderWidth(content: string, editor: ICodeEditor, textModel: ITextModel): number;
export declare function getEditorValidOverlayRect(editor: ObservableCodeEditor): IObservable<Rect>;
export declare class StatusBarViewItem extends MenuEntryActionViewItem {
    protected readonly _updateLabelListener: import("../../../../../../../base/common/lifecycle.js").IDisposable;
    protected updateLabel(): void;
    protected updateTooltip(): void;
}
export declare class UniqueUriGenerator {
    readonly scheme: string;
    private static _modelId;
    constructor(scheme: string);
    getUniqueUri(): URI;
}
export declare function applyEditToModifiedRangeMappings(rangeMapping: RangeMapping[], edit: TextEdit): RangeMapping[];
export declare function classNames(...classes: (string | false | undefined | null)[]): string;
export declare function createReindentEdit(text: string, range: LineRange, tabSize: number): TextEdit;
export declare class PathBuilder {
    private _data;
    moveTo(point: Point): this;
    lineTo(point: Point): this;
    curveTo(cp: Point, to: Point): this;
    curveTo2(cp1: Point, cp2: Point, to: Point): this;
    build(): string;
}
export declare function createRectangle(layout: {
    topLeft: Point;
    width: number;
    height: number;
}, padding: number | {
    top: number;
    right: number;
    bottom: number;
    left: number;
}, borderRadius: number | {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
}, options?: {
    hideLeft?: boolean;
    hideRight?: boolean;
    hideTop?: boolean;
    hideBottom?: boolean;
}): string;
type RemoveFalsy<T> = T extends false | undefined | null ? never : T;
type Falsy<T> = T extends false | undefined | null ? T : never;
export declare function mapOutFalsy<T>(obs: IObservable<T>): IObservable<IObservable<RemoveFalsy<T>> | Falsy<T>>;
export declare function observeElementPosition(element: HTMLElement, store: DisposableStore): {
    top: import("../../../../../../../base/common/observable.js").ISettableObservable<number, void>;
    left: import("../../../../../../../base/common/observable.js").ISettableObservable<number, void>;
};
export declare function rectToProps(fn: (reader: IReader) => Rect | undefined, debugLocation?: DebugLocation): {
    left: import("../../../../../../../base/common/observable.js").IObservableWithChange<number | undefined, void>;
    top: import("../../../../../../../base/common/observable.js").IObservableWithChange<number | undefined, void>;
    width: import("../../../../../../../base/common/observable.js").IObservableWithChange<number | undefined, void>;
    height: import("../../../../../../../base/common/observable.js").IObservableWithChange<number | undefined, void>;
};
export type FirstFnArg<T> = T extends (arg: infer U) => any ? U : never;
export declare function observeEditorBoundingClientRect(editor: ICodeEditor, store: DisposableStore): IObservable<DOMRectReadOnly>;
export {};
