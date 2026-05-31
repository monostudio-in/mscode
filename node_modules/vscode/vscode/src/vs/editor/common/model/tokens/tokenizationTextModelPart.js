
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { CharCode } from '../../../../base/common/charCode.js';
import { BugIndicatingError } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { countEOL } from '../../core/misc/eolCounter.js';
import { Position } from '../../core/position.js';
import { getWordAtText } from '../../core/wordHelper.js';
import { ILanguageService } from '../../languages/language.service.js';
import { ILanguageConfigurationService } from '../../languages/languageConfigurationRegistry.service.js';
import { TextModelPart } from '../textModelPart.js';
import { TreeSitterSyntaxTokenBackend } from './treeSitter/treeSitterSyntaxTokenBackend.js';
import { SparseTokensStore } from '../../tokens/sparseTokensStore.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { TokenizerSyntaxTokenBackend } from './tokenizerSyntaxTokenBackend.js';
import { ITreeSitterLibraryService } from '../../services/treeSitter/treeSitterLibraryService.service.js';
import '../../../../base/common/observableInternal/index.js';
import { observableValue } from '../../../../base/common/observableInternal/observables/observableValue.js';
import { derived } from '../../../../base/common/observableInternal/observables/derived.js';

var TokenizationTextModelPart_1;
let TokenizationTextModelPart = TokenizationTextModelPart_1 = class TokenizationTextModelPart extends TextModelPart {
    constructor(
        _textModel,
        _bracketPairsTextModelPart,
        _languageId,
        _attachedViews,
        _languageService,
        _languageConfigurationService,
        _instantiationService,
        _treeSitterLibraryService
    ) {
        super();
        this._textModel = _textModel;
        this._bracketPairsTextModelPart = _bracketPairsTextModelPart;
        this._languageId = _languageId;
        this._attachedViews = _attachedViews;
        this._languageService = _languageService;
        this._languageConfigurationService = _languageConfigurationService;
        this._instantiationService = _instantiationService;
        this._treeSitterLibraryService = _treeSitterLibraryService;
        this._onDidChangeFontTokens = this._register(( new Emitter()));
        this.onDidChangeFontTokens = this._onDidChangeFontTokens.event;
        this._languageIdObs = observableValue(this, this._languageId);
        this._useTreeSitter = derived(this, reader => {
            const languageId = this._languageIdObs.read(reader);
            return this._treeSitterLibraryService.supportsLanguage(languageId, reader);
        });
        this.tokens = derived(this, reader => {
            let tokens;
            if (this._useTreeSitter.read(reader)) {
                tokens = reader.store.add(this._instantiationService.createInstance(
                    TreeSitterSyntaxTokenBackend,
                    this._languageIdObs,
                    this._languageService.languageIdCodec,
                    this._textModel,
                    this._attachedViews.visibleLineRanges
                ));
            } else {
                tokens = reader.store.add(( new TokenizerSyntaxTokenBackend(
                    this._languageService.languageIdCodec,
                    this._textModel,
                    () => this._languageId,
                    this._attachedViews
                )));
            }
            reader.store.add(tokens.onDidChangeTokens(e => {
                this._emitModelTokensChangedEvent(e);
            }));
            reader.store.add(tokens.onDidChangeFontTokens(e => {
                if (!this._textModel._isDisposing()) {
                    this._onDidChangeFontTokens.fire(e);
                }
            }));
            reader.store.add(tokens.onDidChangeBackgroundTokenizationState(e => {
                this._bracketPairsTextModelPart.handleDidChangeBackgroundTokenizationState();
            }));
            return tokens;
        });
        let hadTokens = false;
        this.tokens.recomputeInitiallyAndOnChange(this._store, value => {
            if (hadTokens) {
                value.todo_resetTokenization();
            }
            hadTokens = true;
        });
        this._semanticTokens = ( new SparseTokensStore(this._languageService.languageIdCodec));
        this._onDidChangeLanguage = this._register(( new Emitter()));
        this.onDidChangeLanguage = this._onDidChangeLanguage.event;
        this._onDidChangeLanguageConfiguration = this._register(( new Emitter()));
        this.onDidChangeLanguageConfiguration = this._onDidChangeLanguageConfiguration.event;
        this._onDidChangeTokens = this._register(( new Emitter()));
        this.onDidChangeTokens = this._onDidChangeTokens.event;
        this._onDidChangeFontTokens = this._register(( new Emitter()));
        this.onDidChangeFontTokens = this._onDidChangeFontTokens.event;
    }
    _hasListeners() {
        return (this._onDidChangeLanguage.hasListeners() || this._onDidChangeLanguageConfiguration.hasListeners() || this._onDidChangeTokens.hasListeners());
    }
    handleLanguageConfigurationServiceChange(e) {
        if (e.affects(this._languageId)) {
            this._onDidChangeLanguageConfiguration.fire({});
        }
    }
    handleDidChangeContent(e) {
        if (e.isFlush) {
            this._semanticTokens.flush();
        } else if (!e.isEolChange) {
            for (const c of e.changes) {
                const [eolCount, firstLineLength, lastLineLength] = countEOL(c.text);
                this._semanticTokens.acceptEdit(
                    c.range,
                    eolCount,
                    firstLineLength,
                    lastLineLength,
                    c.text.length > 0 ? c.text.charCodeAt(0) : CharCode.Null
                );
            }
        }
        this.tokens.get().handleDidChangeContent(e);
    }
    handleDidChangeAttached() {
        this.tokens.get().handleDidChangeAttached();
    }
    getLineTokens(lineNumber) {
        this.validateLineNumber(lineNumber);
        const syntacticTokens = this.tokens.get().getLineTokens(lineNumber);
        return this._semanticTokens.addSparseTokens(lineNumber, syntacticTokens);
    }
    _emitModelTokensChangedEvent(e) {
        if (!this._textModel._isDisposing()) {
            this._bracketPairsTextModelPart.handleDidChangeTokens(e);
            this._onDidChangeTokens.fire(e);
        }
    }
    validateLineNumber(lineNumber) {
        if (lineNumber < 1 || lineNumber > this._textModel.getLineCount()) {
            throw ( new BugIndicatingError("Illegal value for lineNumber"));
        }
    }
    get hasTokens() {
        return this.tokens.get().hasTokens;
    }
    resetTokenization() {
        this.tokens.get().todo_resetTokenization();
    }
    get backgroundTokenizationState() {
        return this.tokens.get().backgroundTokenizationState;
    }
    forceTokenization(lineNumber) {
        this.validateLineNumber(lineNumber);
        this.tokens.get().forceTokenization(lineNumber);
    }
    hasAccurateTokensForLine(lineNumber) {
        this.validateLineNumber(lineNumber);
        return this.tokens.get().hasAccurateTokensForLine(lineNumber);
    }
    isCheapToTokenize(lineNumber) {
        this.validateLineNumber(lineNumber);
        return this.tokens.get().isCheapToTokenize(lineNumber);
    }
    tokenizeIfCheap(lineNumber) {
        this.validateLineNumber(lineNumber);
        this.tokens.get().tokenizeIfCheap(lineNumber);
    }
    getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
        return this.tokens.get().getTokenTypeIfInsertingCharacter(lineNumber, column, character);
    }
    tokenizeLinesAt(lineNumber, lines) {
        return this.tokens.get().tokenizeLinesAt(lineNumber, lines);
    }
    setSemanticTokens(tokens, isComplete) {
        this._semanticTokens.set(tokens, isComplete, this._textModel);
        this._emitModelTokensChangedEvent({
            semanticTokensApplied: tokens !== null,
            ranges: [{
                fromLineNumber: 1,
                toLineNumber: this._textModel.getLineCount()
            }]
        });
    }
    hasCompleteSemanticTokens() {
        return this._semanticTokens.isComplete();
    }
    hasSomeSemanticTokens() {
        return !this._semanticTokens.isEmpty();
    }
    setPartialSemanticTokens(range, tokens) {
        if (this.hasCompleteSemanticTokens()) {
            return;
        }
        const changedRange = this._textModel.validateRange(this._semanticTokens.setPartial(range, tokens));
        this._emitModelTokensChangedEvent({
            semanticTokensApplied: true,
            ranges: [{
                fromLineNumber: changedRange.startLineNumber,
                toLineNumber: changedRange.endLineNumber
            }]
        });
    }
    getWordAtPosition(_position) {
        this.assertNotDisposed();
        const position = this._textModel.validatePosition(_position);
        const lineContent = this._textModel.getLineContent(position.lineNumber);
        const lineTokens = this.getLineTokens(position.lineNumber);
        const tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
        const [rbStartOffset, rbEndOffset] = TokenizationTextModelPart_1._findLanguageBoundaries(lineTokens, tokenIndex);
        const rightBiasedWord = getWordAtText(
            position.column,
            this.getLanguageConfiguration(lineTokens.getLanguageId(tokenIndex)).getWordDefinition(),
            lineContent.substring(rbStartOffset, rbEndOffset),
            rbStartOffset
        );
        if (rightBiasedWord && rightBiasedWord.startColumn <= _position.column && _position.column <= rightBiasedWord.endColumn) {
            return rightBiasedWord;
        }
        if (tokenIndex > 0 && rbStartOffset === position.column - 1) {
            const [lbStartOffset, lbEndOffset] = TokenizationTextModelPart_1._findLanguageBoundaries(lineTokens, tokenIndex - 1);
            const leftBiasedWord = getWordAtText(
                position.column,
                this.getLanguageConfiguration(lineTokens.getLanguageId(tokenIndex - 1)).getWordDefinition(),
                lineContent.substring(lbStartOffset, lbEndOffset),
                lbStartOffset
            );
            if (leftBiasedWord && leftBiasedWord.startColumn <= _position.column && _position.column <= leftBiasedWord.endColumn) {
                return leftBiasedWord;
            }
        }
        return null;
    }
    getLanguageConfiguration(languageId) {
        return this._languageConfigurationService.getLanguageConfiguration(languageId);
    }
    static _findLanguageBoundaries(lineTokens, tokenIndex) {
        const languageId = lineTokens.getLanguageId(tokenIndex);
        let startOffset = 0;
        for (let i = tokenIndex; i >= 0 && lineTokens.getLanguageId(i) === languageId; i--) {
            startOffset = lineTokens.getStartOffset(i);
        }
        let endOffset = lineTokens.getLineContent().length;
        for (let i = tokenIndex, tokenCount = lineTokens.getCount(); i < tokenCount && lineTokens.getLanguageId(i) === languageId; i++) {
            endOffset = lineTokens.getEndOffset(i);
        }
        return [startOffset, endOffset];
    }
    getWordUntilPosition(position) {
        const wordAtPosition = this.getWordAtPosition(position);
        if (!wordAtPosition) {
            return {
                word: "",
                startColumn: position.column,
                endColumn: position.column
            };
        }
        return {
            word: wordAtPosition.word.substr(0, position.column - wordAtPosition.startColumn),
            startColumn: wordAtPosition.startColumn,
            endColumn: position.column
        };
    }
    getLanguageId() {
        return this._languageId;
    }
    getLanguageIdAtPosition(lineNumber, column) {
        const position = this._textModel.validatePosition(( new Position(lineNumber, column)));
        const lineTokens = this.getLineTokens(position.lineNumber);
        return lineTokens.getLanguageId(lineTokens.findTokenIndexAtOffset(position.column - 1));
    }
    setLanguageId(languageId, source = "api") {
        if (this._languageId === languageId) {
            return;
        }
        const e = {
            oldLanguage: this._languageId,
            newLanguage: languageId,
            source
        };
        this._languageId = languageId;
        this._languageIdObs.set(languageId, undefined);
        this._bracketPairsTextModelPart.handleDidChangeLanguage(e);
        this._onDidChangeLanguage.fire(e);
        this._onDidChangeLanguageConfiguration.fire({});
    }
};
TokenizationTextModelPart = TokenizationTextModelPart_1 = ( __decorate([( __param(4, ILanguageService)), ( __param(5, ILanguageConfigurationService)), ( __param(6, IInstantiationService)), ( __param(7, ITreeSitterLibraryService))], TokenizationTextModelPart));

export { TokenizationTextModelPart };
