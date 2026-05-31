import { Event } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../../base/common/observable.js";
import { ICodeEditor } from "../../../../../browser/editorBrowser.js";
import { Range } from "../../../../../common/core/range.js";
import { IconPath, InlineCompletionWarning } from "../../../../../common/languages.js";
import { ILanguageService } from "../../../../../common/languages/language.service.js";
import { LineTokens } from "../../../../../common/tokens/lineTokens.js";
import { LineDecoration } from "../../../../../common/viewLayout/lineDecorations.js";
import { GhostText, GhostTextReplacement } from "../../model/ghostText.js";
import { IMouseEvent } from "../../../../../../base/browser/mouseEvent.js";
import { InlineCompletionViewData } from "../inlineEdits/inlineEditsViewInterface.js";
import { IEquatable } from "../../../../../../base/common/equals.js";
export interface IGhostTextWidgetData {
    readonly ghostText: GhostText | GhostTextReplacement;
    readonly warning: GhostTextWidgetWarning | undefined;
    handleInlineCompletionShown(viewData: InlineCompletionViewData): void;
}
export declare class GhostTextWidgetWarning {
    readonly icon: IconPath;
    static from(warning: InlineCompletionWarning | undefined): GhostTextWidgetWarning | undefined;
    constructor(icon?: IconPath);
}
export declare class GhostTextView extends Disposable {
    private readonly _editor;
    private readonly _data;
    private readonly _languageService;
    private readonly _isDisposed;
    private readonly _editorObs;
    private readonly _warningState;
    private readonly _onDidClick;
    readonly onDidClick: Event<IMouseEvent>;
    private readonly _extraClasses;
    private readonly _isClickable;
    private readonly _shouldKeepCursorStable;
    private readonly _minReservedLineCount;
    private readonly _useSyntaxHighlighting;
    private readonly _highlightShortText;
    constructor(_editor: ICodeEditor, _data: IObservable<IGhostTextWidgetData | undefined>, options: {
        extraClasses?: readonly string[];
        isClickable?: boolean;
        shouldKeepCursorStable?: boolean;
        minReservedLineCount?: IObservable<number>;
        useSyntaxHighlighting?: IObservable<boolean>;
        highlightShortSuggestions?: boolean;
    }, _languageService: ILanguageService);
    static getWarningWidgetContext(domNode: HTMLElement): {
        range: Range;
    } | undefined;
    private readonly _nonWhitespaceCount;
    private readonly _extraClassNames;
    private readonly _state;
    private readonly _decorations;
    private readonly _additionalLinesWidget;
    private readonly _isInlineTextHovered;
    readonly isHovered: import("../../../../../../base/common/observable.js").IObservableWithChange<boolean, void>;
    readonly height: import("../../../../../../base/common/observable.js").IObservableWithChange<number, void>;
    ownsViewZone(viewZoneId: string): boolean;
}
declare class AdditionalLinesData implements IEquatable<AdditionalLinesData> {
    readonly lineNumber: number;
    readonly additionalLines: readonly LineData[];
    readonly minReservedLineCount: number;
    constructor(lineNumber: number, additionalLines: readonly LineData[], minReservedLineCount: number);
    equals(other: AdditionalLinesData): boolean;
}
export declare class AdditionalLinesWidget extends Disposable {
    private readonly _editor;
    private readonly _lines;
    private readonly _shouldKeepCursorStable;
    private readonly _isClickable;
    private _viewZoneInfo;
    get viewZoneId(): string | undefined;
    private _viewZoneHeight;
    get viewZoneHeight(): IObservable<number | undefined>;
    private readonly editorOptionsChanged;
    private readonly _onDidClick;
    readonly onDidClick: Event<IMouseEvent>;
    private readonly _viewZoneListener;
    readonly isHovered: IObservable<boolean>;
    private hasBeenAccepted;
    constructor(_editor: ICodeEditor, _lines: IObservable<AdditionalLinesData | undefined>, _shouldKeepCursorStable: boolean, _isClickable: boolean);
    dispose(): void;
    private clear;
    private updateLines;
    private addViewZone;
    private removeActiveViewZone;
    private keepCursorStable;
}
export declare class LineData implements IEquatable<LineData> {
    readonly content: LineTokens;
    readonly decorations: readonly LineDecoration[];
    constructor(content: LineTokens, // Must not contain a linebreak!
    decorations: readonly LineDecoration[]);
    equals(other: LineData): boolean;
}
export declare const ttPolicy: Pick<TrustedTypePolicy, "name" | "createHTML"> | undefined;
export {};
