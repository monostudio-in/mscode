import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.service.js";
import { IBulkEditService } from "../../../../browser/services/bulkEditService.service.js";
import { TextReplacement } from "../../../../common/core/edits/textEdit.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { StandardTokenType } from "../../../../common/encodedTokenAttributes.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.service.js";
import { ITextModel } from "../../../../common/model.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.service.js";
import { InlineSuggestionItem } from "./inlineSuggestionItem.js";
import { InlineCompletionContextWithoutUuid } from "./provideInlineCompletions.js";
import { IRenameSymbolTrackerService } from "../../../../browser/services/renameSymbolTrackerService.service.js";
import type { URI } from "../../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../browser/services/codeEditorService.service.js";
declare enum RenameKind {
    no = "no",
    yes = "yes",
    maybe = "maybe"
}
declare namespace RenameKind {
    function fromString(value: string): RenameKind;
}
export declare namespace PrepareNesRenameResult {
    type Yes = {
        canRename: RenameKind.yes;
        oldName: string;
        onOldState: boolean;
    };
    type Maybe = {
        canRename: RenameKind.maybe;
        oldName: string;
        onOldState: boolean;
    };
    type No = {
        canRename: RenameKind.no;
        timedOut: boolean;
        reason?: string;
    };
}
export type PrepareNesRenameResult = PrepareNesRenameResult.Yes | PrepareNesRenameResult.Maybe | PrepareNesRenameResult.No;
export type TextChange = {
    range: {
        start: {
            line: number;
            character: number;
        };
        end: {
            line: number;
            character: number;
        };
    };
    newText?: string;
};
export type RenameGroup = {
    file: URI;
    changes: TextChange[];
};
export type RenameEdits = {
    renames: {
        edits: TextReplacement[];
        position: Position;
        oldName: string;
        newName: string;
    };
    others: {
        edits: TextReplacement[];
    };
};
export declare class RenameInferenceEngine {
    constructor();
    inferRename(textModel: ITextModel, editRange: Range, insertText: string, wordDefinition: RegExp): RenameEdits | undefined;
    protected getTokenAtPosition(textModel: ITextModel, position: Position): {
        type: StandardTokenType;
        range: Range;
    };
}
export declare class RenameSymbolProcessor extends Disposable {
    private readonly _commandService;
    private readonly _languageFeaturesService;
    private readonly _languageConfigurationService;
    private readonly _renameSymbolTrackerService;
    private readonly _codeEditorService;
    private readonly _renameInferenceEngine;
    private _renameRunnable;
    constructor(_commandService: ICommandService, _languageFeaturesService: ILanguageFeaturesService, _languageConfigurationService: ILanguageConfigurationService, bulkEditService: IBulkEditService, _renameSymbolTrackerService: IRenameSymbolTrackerService, _codeEditorService: ICodeEditorService);
    proposeRenameRefactoring(textModel: ITextModel, suggestItem: InlineSuggestionItem, context: InlineCompletionContextWithoutUuid): Promise<InlineSuggestionItem>;
    private checkRenamePrecondition;
    private isRenamePossible;
}
export {};
