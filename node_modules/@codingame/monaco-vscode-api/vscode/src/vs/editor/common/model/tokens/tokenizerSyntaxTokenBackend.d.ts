import { Emitter, Event } from "../../../../base/common/event.js";
import { StandardTokenType } from "../../encodedTokenAttributes.js";
import { ILanguageIdCodec } from "../../languages.js";
import { IModelContentChangedEvent } from "../../textModelEvents.js";
import { BackgroundTokenizationState } from "../../tokenizationTextModelPart.js";
import { LineTokens } from "../../tokens/lineTokens.js";
import { TextModel } from "../textModel.js";
import { AbstractSyntaxTokenBackend, AttachedViews } from "./abstractSyntaxTokenBackend.js";
/** For TextMate */
export declare class TokenizerSyntaxTokenBackend extends AbstractSyntaxTokenBackend {
    private readonly getLanguageId;
    private _tokenizer;
    protected _backgroundTokenizationState: BackgroundTokenizationState;
    protected readonly _onDidChangeBackgroundTokenizationState: Emitter<void>;
    readonly onDidChangeBackgroundTokenizationState: Event<void>;
    private _defaultBackgroundTokenizer;
    private readonly _backgroundTokenizer;
    private readonly _tokens;
    private _debugBackgroundTokens;
    private _debugBackgroundStates;
    private readonly _debugBackgroundTokenizer;
    private readonly _attachedViewStates;
    constructor(languageIdCodec: ILanguageIdCodec, textModel: TextModel, getLanguageId: () => string, attachedViews: AttachedViews);
    todo_resetTokenization(fireTokenChangeEvent?: boolean): void;
    handleDidChangeAttached(): void;
    handleDidChangeContent(e: IModelContentChangedEvent): void;
    private setTokens;
    private setFontInfo;
    private refreshAllVisibleLineTokens;
    private refreshRanges;
    private refreshRange;
    forceTokenization(lineNumber: number): void;
    hasAccurateTokensForLine(lineNumber: number): boolean;
    isCheapToTokenize(lineNumber: number): boolean;
    getLineTokens(lineNumber: number): LineTokens;
    getTokenTypeIfInsertingCharacter(lineNumber: number, column: number, character: string): StandardTokenType;
    tokenizeLinesAt(lineNumber: number, lines: string[]): LineTokens[] | null;
    get hasTokens(): boolean;
}
