import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.service.js";
import { Event } from "../../../../base/common/event.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.service.js";
import { StickyRange } from "./stickyScrollElement.js";
export declare class StickyLineCandidate {
    readonly startLineNumber: number;
    readonly endLineNumber: number;
    readonly top: number;
    readonly height: number;
    constructor(startLineNumber: number, endLineNumber: number, top: number, height: number);
}
export interface IStickyLineCandidateProvider {
    /**
     * Dispose resources used by the provider.
     */
    dispose(): void;
    /**
     * Get the version ID of the sticky model.
     */
    getVersionId(): number | undefined;
    /**
     * Update the sticky line candidates.
     */
    update(): Promise<void>;
    /**
     * Get sticky line candidates intersecting a given range.
     */
    getCandidateStickyLinesIntersecting(range: StickyRange): StickyLineCandidate[];
    /**
     * Event triggered when sticky scroll changes.
     */
    readonly onDidChangeStickyScroll: Event<void>;
}
export declare class StickyLineCandidateProvider extends Disposable implements IStickyLineCandidateProvider {
    private readonly _languageFeaturesService;
    private readonly _languageConfigurationService;
    static readonly ID = "store.contrib.stickyScrollController";
    private readonly _onDidChangeStickyScroll;
    readonly onDidChangeStickyScroll: Event<void>;
    private readonly _editor;
    private readonly _updateSoon;
    private readonly _sessionStore;
    private _model;
    private _cts;
    private _stickyModelProvider;
    constructor(editor: ICodeEditor, _languageFeaturesService: ILanguageFeaturesService, _languageConfigurationService: ILanguageConfigurationService);
    /**
     * Read and apply the sticky scroll configuration.
     */
    private readConfiguration;
    /**
     * Get the version ID of the sticky model.
     */
    getVersionId(): number | undefined;
    /**
     * Update the sticky model provider.
     */
    private updateStickyModelProvider;
    /**
     * Update the sticky line candidates.
     */
    update(): Promise<void>;
    /**
     * Update the sticky model based on the current editor state.
     */
    private updateStickyModel;
    /**
     * Get sticky line candidates intersecting a given range.
     */
    getCandidateStickyLinesIntersecting(range: StickyRange): StickyLineCandidate[];
    /**
     * Get sticky line candidates intersecting a given range from the sticky model.
     */
    private getCandidateStickyLinesIntersectingFromStickyModel;
    /**
     * Filter out sticky line candidates that are within hidden ranges.
     */
    private filterHiddenRanges;
    /**
     * Update the binary search index.
     */
    private updateIndex;
}
