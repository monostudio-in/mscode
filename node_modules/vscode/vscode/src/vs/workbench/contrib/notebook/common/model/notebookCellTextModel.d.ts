import { Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import * as model from "../../../../../editor/common/model.js";
import { TextModel } from "../../../../../editor/common/model/textModel.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.service.js";
import { CellInternalMetadataChangedEvent, CellKind, ICell, ICellDto2, ICellOutput, IOutputItemDto, NotebookCellCollapseState, NotebookCellDefaultCollapseConfig, NotebookCellInternalMetadata, NotebookCellMetadata, NotebookCellOutputsSplice, TransientCellMetadata, TransientOptions } from "../notebookCommon.js";
import { ILanguageDetectionService } from "../../../../services/languageDetection/common/languageDetectionWorkerService.service.js";
import { IModelContentChangedEvent } from "../../../../../editor/common/textModelEvents.js";
import { INotebookLoggingService } from "../notebookLoggingService.service.js";
export declare class NotebookCellTextModel extends Disposable implements ICell {
    readonly uri: URI;
    readonly handle: number;
    readonly transientOptions: TransientOptions;
    private readonly _languageService;
    private readonly _defaultEOL;
    private readonly _languageDetectionService;
    private readonly _notebookLoggingService;
    private readonly _onDidChangeTextModel;
    readonly onDidChangeTextModel: Event<void>;
    private readonly _onDidChangeOutputs;
    readonly onDidChangeOutputs: Event<NotebookCellOutputsSplice>;
    private readonly _onDidChangeOutputItems;
    readonly onDidChangeOutputItems: Event<void>;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<"content" | "language" | "mime" | {
        type: "model";
        event: IModelContentChangedEvent;
    }>;
    private readonly _onDidChangeMetadata;
    readonly onDidChangeMetadata: Event<void>;
    private readonly _onDidChangeInternalMetadata;
    readonly onDidChangeInternalMetadata: Event<CellInternalMetadataChangedEvent>;
    private readonly _onDidChangeLanguage;
    readonly onDidChangeLanguage: Event<string>;
    private _outputs;
    get outputs(): ICellOutput[];
    private _metadata;
    get metadata(): NotebookCellMetadata;
    set metadata(newMetadata: NotebookCellMetadata);
    private _internalMetadata;
    get internalMetadata(): NotebookCellInternalMetadata;
    set internalMetadata(newInternalMetadata: NotebookCellInternalMetadata);
    get language(): string;
    set language(newLanguage: string);
    get mime(): string | undefined;
    set mime(newMime: string | undefined);
    private _textBuffer;
    get textBuffer(): model.ITextBuffer;
    private _textBufferHash;
    private _hash;
    private _versionId;
    private _alternativeId;
    get alternativeId(): number;
    private readonly _textModelDisposables;
    private _textModel;
    get textModel(): TextModel | undefined;
    set textModel(m: TextModel | undefined);
    private setRegisteredLanguage;
    private static readonly AUTO_DETECT_LANGUAGE_THROTTLE_DELAY;
    private readonly autoDetectLanguageThrottler;
    private _autoLanguageDetectionEnabled;
    private _hasLanguageSetExplicitly;
    get hasLanguageSetExplicitly(): boolean;
    private _source;
    private _language;
    private _mime;
    readonly cellKind: CellKind;
    readonly collapseState: NotebookCellCollapseState | undefined;
    constructor(uri: URI, handle: number, cell: ICellDto2, transientOptions: TransientOptions, _languageService: ILanguageService, _defaultEOL: model.DefaultEndOfLine, defaultCollapseConfig: NotebookCellDefaultCollapseConfig | undefined, _languageDetectionService: ILanguageDetectionService | undefined, _notebookLoggingService: INotebookLoggingService);
    enableAutoLanguageDetection(): void;
    autoDetectLanguage(): Promise<void>;
    private _doAutoDetectLanguage;
    private _setLanguageInternal;
    resetTextBuffer(textBuffer: model.ITextBuffer): void;
    getValue(): string;
    getTextBufferHash(): string;
    getHashValue(): number;
    private _getPersisentMetadata;
    getTextLength(): number;
    getFullModelRange(): Range;
    spliceNotebookCellOutputs(splice: NotebookCellOutputsSplice): void;
    replaceOutput(outputId: string, newOutputItem: ICellOutput): boolean;
    changeOutputItems(outputId: string, append: boolean, items: IOutputItemDto[]): boolean;
    private _outputNotEqualFastCheck;
    equal(b: NotebookCellTextModel): boolean;
    /**
     * Only compares
     * - language
     * - mime
     * - cellKind
     * - internal metadata (conditionally)
     * - source
     */
    fastEqual(b: ICellDto2, ignoreMetadata: boolean): boolean;
    private static linesAreEqual;
    dispose(): void;
}
export declare function cloneNotebookCellTextModel(cell: NotebookCellTextModel): {
    source: string;
    language: string;
    mime: string | undefined;
    cellKind: CellKind;
    outputs: {
        outputs: IOutputItemDto[];
        outputId: string;
    }[];
    metadata: {};
};
export declare function getFormattedMetadataJSON(transientCellMetadata: TransientCellMetadata | undefined, metadata: NotebookCellMetadata, language?: string, sortKeys?: boolean): string;
/**
 * Sort the JSON to ensure when diffing, the JSON keys are sorted & matched correctly in diff view.
 */
export declare function sortObjectPropertiesRecursively(obj: any): any;
