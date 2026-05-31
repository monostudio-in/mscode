import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IObservable, IObservableWithChange, ITransaction } from "../../../../../base/common/observable.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.service.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.service.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.service.js";
import { StringEdit } from "../../../../common/core/edits/stringEdit.js";
import { Position } from "../../../../common/core/position.js";
import { InlineCompletionsProvider } from "../../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.service.js";
import { ITextModel } from "../../../../common/model.js";
import { IFeatureDebounceInformation } from "../../../../common/services/languageFeatureDebounce.js";
import { ITextModelService } from "../../../../common/services/resolverService.service.js";
import { IModelContentChangedEvent } from "../../../../common/textModelEvents.js";
import { InlineSuggestionIdentity, InlineSuggestionItem } from "./inlineSuggestionItem.js";
import { InlineCompletionContextWithoutUuid, InlineSuggestRequestInfo } from "./provideInlineCompletions.js";
export declare class InlineCompletionsSource extends Disposable {
    private readonly _textModel;
    private readonly _versionId;
    private readonly _debounceValue;
    private readonly _cursorPosition;
    private readonly _languageConfigurationService;
    private readonly _logService;
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _contextKeyService;
    private readonly _textModelService;
    private static _requestId;
    private readonly _updateOperation;
    private readonly _loggingEnabled;
    private readonly _sendRequestData;
    private readonly _structuredFetchLogger;
    private readonly _state;
    readonly inlineCompletions: IObservable<InlineCompletionsState>;
    readonly suggestWidgetInlineCompletions: IObservable<InlineCompletionsState>;
    private readonly _renameProcessor;
    private _completionsEnabled;
    constructor(_textModel: ITextModel, _versionId: IObservableWithChange<number | null, IModelContentChangedEvent | undefined>, _debounceValue: IFeatureDebounceInformation, _cursorPosition: IObservable<Position>, _languageConfigurationService: ILanguageConfigurationService, _logService: ILogService, _configurationService: IConfigurationService, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _textModelService: ITextModelService);
    private _updateCompletionsEnablement;
    readonly clearOperationOnTextModelChange: IObservableWithChange<undefined, void>;
    private _log;
    private readonly _loadingCount;
    readonly loading: IObservable<boolean>;
    fetch(providers: InlineCompletionsProvider[], providersLabel: string | undefined, context: InlineCompletionContextWithoutUuid, activeInlineCompletion: InlineSuggestionIdentity | undefined, withDebounce: boolean, userJumpedToActiveCompletion: IObservable<boolean>, requestInfo: InlineSuggestRequestInfo): Promise<boolean>;
    clear(tx: ITransaction): void;
    seedInlineCompletionsWithSuggestWidget(): void;
    /**
     * Seeds the inline completions with an external inline completion item.
     * Used when transplanting a completion from one model to another (cross-file edits).
     */
    seedWithCompletion(item: InlineSuggestionItem, tx: ITransaction): void;
    private _sendInlineCompletionsRequestTelemetry;
    clearSuggestWidgetInlineCompletions(tx: ITransaction): void;
    cancelUpdate(): void;
}
declare class UpdateRequest {
    readonly position: Position;
    readonly context: InlineCompletionContextWithoutUuid;
    readonly versionId: number;
    readonly providers: Set<InlineCompletionsProvider>;
    constructor(position: Position, context: InlineCompletionContextWithoutUuid, versionId: number, providers: Set<InlineCompletionsProvider>);
    satisfies(other: UpdateRequest): boolean;
    get isExplicitRequest(): boolean;
}
export declare class InlineCompletionsState extends Disposable {
    readonly inlineCompletions: readonly InlineSuggestionItem[];
    readonly request: UpdateRequest | undefined;
    static createEmpty(): InlineCompletionsState;
    constructor(inlineCompletions: readonly InlineSuggestionItem[], request: UpdateRequest | undefined);
    private _findById;
    private _findByHash;
    /**
     * Applies the edit on the state.
    */
    createStateWithAppliedEdit(edit: StringEdit, textModel: ITextModel): InlineCompletionsState;
    createStateWithAppliedResults(updatedSuggestions: InlineSuggestionItem[], request: UpdateRequest, textModel: ITextModel, cursorPosition: Position, itemIdToPreserveAtTop: InlineSuggestionIdentity | undefined): InlineCompletionsState;
    clone(): InlineCompletionsState;
}
export {};
