import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { LineRange } from "../../core/ranges/lineRange.js";
import { StandardTokenType } from "../../encodedTokenAttributes.js";
import { ILanguageIdCodec } from "../../languages.js";
import { IAttachedView } from "../../model.js";
import { TextModel } from "../textModel.js";
import { IModelContentChangedEvent, IModelTokensChangedEvent, IModelFontTokensChangedEvent } from "../../textModelEvents.js";
import { BackgroundTokenizationState } from "../../tokenizationTextModelPart.js";
import { LineTokens } from "../../tokens/lineTokens.js";
import { IObservable } from "../../../../base/common/observable.js";
/**
 * @internal
 */
export declare class AttachedViews implements IDisposable {
    private readonly _onDidChangeVisibleRanges;
    readonly onDidChangeVisibleRanges: Event<{
        view: IAttachedView;
        state: AttachedViewState | undefined;
    }>;
    private readonly _views;
    private readonly _viewsChanged;
    readonly visibleLineRanges: IObservable<readonly LineRange[]>;
    constructor();
    attachView(): IAttachedView;
    detachView(view: IAttachedView): void;
    dispose(): void;
}
/**
 * @internal
 */
export declare class AttachedViewState {
    readonly visibleLineRanges: readonly LineRange[];
    readonly stabilized: boolean;
    constructor(visibleLineRanges: readonly LineRange[], stabilized: boolean);
    equals(other: AttachedViewState): boolean;
}
export declare class AttachedViewHandler extends Disposable {
    private readonly _refreshTokens;
    private readonly runner;
    private _computedLineRanges;
    private _lineRanges;
    get lineRanges(): readonly LineRange[];
    constructor(_refreshTokens: () => void);
    private update;
    handleStateChange(state: AttachedViewState): void;
}
export declare abstract class AbstractSyntaxTokenBackend extends Disposable {
    protected readonly _languageIdCodec: ILanguageIdCodec;
    protected readonly _textModel: TextModel;
    protected abstract _backgroundTokenizationState: BackgroundTokenizationState;
    get backgroundTokenizationState(): BackgroundTokenizationState;
    protected abstract readonly _onDidChangeBackgroundTokenizationState: Emitter<void>;
    /** @internal, should not be exposed by the text model! */
    abstract readonly onDidChangeBackgroundTokenizationState: Event<void>;
    protected readonly _onDidChangeTokens: Emitter<IModelTokensChangedEvent>;
    /** @internal, should not be exposed by the text model! */
    readonly onDidChangeTokens: Event<IModelTokensChangedEvent>;
    protected readonly _onDidChangeFontTokens: Emitter<IModelFontTokensChangedEvent>;
    /** @internal, should not be exposed by the text model! */
    readonly onDidChangeFontTokens: Event<IModelFontTokensChangedEvent>;
    constructor(_languageIdCodec: ILanguageIdCodec, _textModel: TextModel);
    abstract todo_resetTokenization(fireTokenChangeEvent?: boolean): void;
    abstract handleDidChangeAttached(): void;
    abstract handleDidChangeContent(e: IModelContentChangedEvent): void;
    abstract forceTokenization(lineNumber: number): void;
    abstract hasAccurateTokensForLine(lineNumber: number): boolean;
    abstract isCheapToTokenize(lineNumber: number): boolean;
    tokenizeIfCheap(lineNumber: number): void;
    abstract getLineTokens(lineNumber: number): LineTokens;
    abstract getTokenTypeIfInsertingCharacter(lineNumber: number, column: number, character: string): StandardTokenType;
    abstract tokenizeLinesAt(lineNumber: number, lines: string[]): LineTokens[] | null;
    abstract get hasTokens(): boolean;
}
