import { URI } from "../../../base/common/uri.js";
import { StringEdit } from "../core/edits/stringEdit.js";
import { IRange } from "../core/range.js";
import { IDocumentDiffProviderOptions, IDocumentDiff } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/editor/common/diff/documentDiffProvider";
import { IChange } from "../diff/legacyLinesDiffComputer.js";
import { TextEdit, IInplaceReplaceSupportResult, IColorInformation } from "../languages.js";
import { IUnicodeHighlightsResult, DiffAlgorithmName } from "./editorWorker.js";
import { FindSectionHeaderOptions, SectionHeader } from "./findSectionHeaders.js";
import { UnicodeHighlighterOptions } from "./unicodeTextModelHighlighter.js";
export declare const IEditorWorkerService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditorWorkerService>;
export interface IEditorWorkerService {
    readonly _serviceBrand: undefined;
    canComputeUnicodeHighlights(uri: URI): boolean;
    computedUnicodeHighlights(uri: URI, options: UnicodeHighlighterOptions, range?: IRange): Promise<IUnicodeHighlightsResult>;
    computeDiff(original: URI, modified: URI, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDocumentDiff | null>;
    canComputeDirtyDiff(original: URI, modified: URI): boolean;
    computeDirtyDiff(original: URI, modified: URI, ignoreTrimWhitespace: boolean): Promise<IChange[] | null>;
    computeMoreMinimalEdits(resource: URI, edits: TextEdit[] | null | undefined, pretty?: boolean): Promise<TextEdit[] | undefined>;
    computeHumanReadableDiff(resource: URI, edits: TextEdit[] | null | undefined): Promise<TextEdit[] | undefined>;
    computeStringEditFromDiff(original: string, modified: string, options: {
        maxComputationTimeMs: number;
    }, algorithm: DiffAlgorithmName): Promise<StringEdit>;
    canComputeWordRanges(resource: URI): boolean;
    computeWordRanges(resource: URI, range: IRange): Promise<{
        [word: string]: IRange[];
    } | null>;
    canNavigateValueSet(resource: URI): boolean;
    navigateValueSet(resource: URI, range: IRange, up: boolean): Promise<IInplaceReplaceSupportResult | null>;
    findSectionHeaders(uri: URI, options: FindSectionHeaderOptions): Promise<SectionHeader[]>;
    computeDefaultDocumentColors(uri: URI): Promise<IColorInformation[] | null>;
}
