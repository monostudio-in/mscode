import { IObservable, ITransaction } from "../../../../../base/common/observable.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.service.js";
import { ISingleEditOperation } from "../../../../common/core/editOperation.js";
import { StringEdit } from "../../../../common/core/edits/stringEdit.js";
import { TextReplacement } from "../../../../common/core/edits/textEdit.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { PositionOffsetTransformerBase } from "../../../../common/core/text/positionToOffset.js";
import { Command, IInlineCompletionHint, InlineCompletion, InlineCompletionEndOfLifeReason, InlineCompletionHintStyle, InlineCompletionWarning, PartialAcceptInfo } from "../../../../common/languages.js";
import { ITextModel } from "../../../../common/model.js";
import { InlineCompletionViewData, InlineCompletionViewKind } from "../view/inlineEdits/inlineEditsViewInterface.js";
import { InlineSuggestionEditKind } from "./editKind.js";
import { IInlineSuggestDataAction, IInlineSuggestDataActionEdit, InlineSuggestData, InlineSuggestionList, PartialAcceptance, RenameInfo, SnippetInfo } from "./provideInlineCompletions.js";
import { InlineSuggestAlternativeAction } from "./InlineSuggestAlternativeAction.js";
import { TextModelValueReference } from "./textModelValueReference.js";
export type InlineSuggestionItem = InlineEditItem | InlineCompletionItem;
export declare namespace InlineSuggestionItem {
    function create(data: InlineSuggestData, textModel: TextModelValueReference, shouldDiffEdit?: boolean): InlineSuggestionItem;
}
export type InlineSuggestionAction = IInlineSuggestionActionEdit | IInlineSuggestionActionJumpTo;
export interface IInlineSuggestionActionEdit {
    kind: "edit";
    textReplacement: TextReplacement;
    snippetInfo: SnippetInfo | undefined;
    stringEdit: StringEdit;
    target: TextModelValueReference;
    alternativeAction: InlineSuggestAlternativeAction | undefined;
}
export interface IInlineSuggestionActionJumpTo {
    kind: "jumpTo";
    position: Position;
    offset: number;
    target: TextModelValueReference;
}
declare abstract class InlineSuggestionItemBase {
    protected readonly _data: InlineSuggestData;
    readonly identity: InlineSuggestionIdentity;
    readonly hint: InlineSuggestHint | undefined;
    /**
     * Reference to the text model this item targets.
     * For cross-file edits, this may differ from the current editor's model.
     */
    readonly originalTextRef: TextModelValueReference;
    constructor(_data: InlineSuggestData, identity: InlineSuggestionIdentity, hint: InlineSuggestHint | undefined, 
    /**
     * Reference to the text model this item targets.
     * For cross-file edits, this may differ from the current editor's model.
     */
    originalTextRef: TextModelValueReference);
    abstract get action(): InlineSuggestionAction | undefined;
    /**
     * A reference to the original inline completion list this inline completion has been constructed from.
     * Used for event data to ensure referential equality.
    */
    get source(): InlineSuggestionList;
    get isFromExplicitRequest(): boolean;
    get forwardStable(): boolean;
    get targetRange(): Range;
    get semanticId(): string;
    get gutterMenuLinkAction(): Command | undefined;
    get command(): Command | undefined;
    get supportsRename(): boolean;
    get warning(): InlineCompletionWarning | undefined;
    get showInlineEditMenu(): boolean;
    get hash(): string;
    /** @deprecated */
    get shownCommand(): Command | undefined;
    get requestUuid(): string;
    get partialAccepts(): PartialAcceptance;
    /**
     * A reference to the original inline completion this inline completion has been constructed from.
     * Used for event data to ensure referential equality.
    */
    private get _sourceInlineCompletion();
    abstract withEdit(userEdit: StringEdit, textModel: ITextModel): InlineSuggestionItem | undefined;
    abstract withIdentity(identity: InlineSuggestionIdentity): InlineSuggestionItem;
    abstract canBeReused(model: ITextModel, position: Position): boolean;
    abstract computeEditKind(model: ITextModel): InlineSuggestionEditKind | undefined;
    addRef(): void;
    removeRef(): void;
    reportInlineEditShown(commandService: ICommandService, viewKind: InlineCompletionViewKind, viewData: InlineCompletionViewData, model: ITextModel, timeWhenShown: number): void;
    reportPartialAccept(acceptedCharacters: number, info: PartialAcceptInfo, partialAcceptance: PartialAcceptance): void;
    reportEndOfLife(reason: InlineCompletionEndOfLifeReason): void;
    setEndOfLifeReason(reason: InlineCompletionEndOfLifeReason): void;
    setIsPreceeded(item: InlineSuggestionItem): void;
    setNotShownReasonIfNotSet(reason: string): void;
    /**
     * Avoid using this method. Instead introduce getters for the needed properties.
    */
    getSourceCompletion(): InlineCompletion;
    setRenameProcessingInfo(info: RenameInfo): void;
    withAction(action: IInlineSuggestDataAction): InlineSuggestData;
    addPerformanceMarker(marker: string): void;
}
export declare class InlineSuggestionIdentity {
    private static idCounter;
    private readonly _onDispose;
    readonly onDispose: IObservable<void>;
    private readonly _jumpedTo;
    get jumpedTo(): IObservable<boolean>;
    private _refCount;
    readonly id: string;
    addRef(): void;
    removeRef(): void;
    setJumpTo(tx: ITransaction | undefined): void;
}
export declare class InlineSuggestHint {
    readonly range: Range;
    readonly content: string;
    readonly style: InlineCompletionHintStyle;
    static create(hint: IInlineCompletionHint): InlineSuggestHint;
    private constructor();
    withEdit(edit: StringEdit, positionOffsetTransformer: PositionOffsetTransformerBase): InlineSuggestHint | undefined;
}
export declare class InlineCompletionItem extends InlineSuggestionItemBase {
    private readonly _edit;
    private readonly _trimmedEdit;
    private readonly _textEdit;
    private readonly _originalRange;
    readonly snippetInfo: SnippetInfo | undefined;
    readonly additionalTextEdits: readonly ISingleEditOperation[];
    static create(data: InlineSuggestData, textModel: TextModelValueReference, action: IInlineSuggestDataActionEdit): InlineCompletionItem;
    readonly isInlineEdit = false;
    private constructor();
    get action(): IInlineSuggestionActionEdit;
    get hash(): string;
    getSingleTextEdit(): TextReplacement;
    withIdentity(identity: InlineSuggestionIdentity): InlineCompletionItem;
    withEdit(textModelEdit: StringEdit, textModel: ITextModel): InlineCompletionItem | undefined;
    canBeReused(model: ITextModel, position: Position): boolean;
    isVisible(model: ITextModel, cursorPosition: Position): boolean;
    computeEditKind(model: ITextModel): InlineSuggestionEditKind | undefined;
    get editRange(): Range;
    get insertText(): string;
}
export declare class InlineEditItem extends InlineSuggestionItemBase {
    private readonly _action;
    private readonly _edits;
    private readonly _lastChangePartOfInlineEdit;
    private readonly _inlineEditModelVersion;
    static createForTest(textModel: TextModelValueReference, range: Range, newText: string): InlineEditItem;
    static create(data: InlineSuggestData, textModel: TextModelValueReference, shouldDiffEdit?: boolean): InlineEditItem;
    readonly snippetInfo: SnippetInfo | undefined;
    readonly additionalTextEdits: readonly ISingleEditOperation[];
    readonly isInlineEdit = true;
    private constructor();
    get updatedEditModelVersion(): number;
    get action(): InlineSuggestionAction | undefined;
    withIdentity(identity: InlineSuggestionIdentity): InlineEditItem;
    canBeReused(model: ITextModel, position: Position): boolean;
    withEdit(textModelChanges: StringEdit, textModel: ITextModel): InlineEditItem | undefined;
    private _applyTextModelChanges;
    computeEditKind(model: ITextModel): InlineSuggestionEditKind | undefined;
}
export {};
