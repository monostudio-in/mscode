import { IReader } from "../../../../../base/common/observable.js";
import { RangeMapping as DiffRangeMapping } from "../../../../../editor/common/diff/rangeMapping.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { IEditorWorkerService } from "../../../../../editor/common/services/editorWorker.service.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.service.js";
import { MergeEditorLineRange } from "./lineRange.js";
import { DetailedLineRangeMapping, RangeMapping } from "./mapping.js";
import { LineRange } from "../../../../../editor/common/core/ranges/lineRange.js";
export interface IMergeDiffComputer {
    computeDiff(textModel1: ITextModel, textModel2: ITextModel, reader: IReader): Promise<IMergeDiffComputerResult>;
}
export interface IMergeDiffComputerResult {
    diffs: DetailedLineRangeMapping[] | null;
}
export declare class MergeDiffComputer implements IMergeDiffComputer {
    private readonly editorWorkerService;
    private readonly configurationService;
    private readonly mergeAlgorithm;
    constructor(editorWorkerService: IEditorWorkerService, configurationService: IConfigurationService);
    computeDiff(textModel1: ITextModel, textModel2: ITextModel, reader: IReader): Promise<IMergeDiffComputerResult>;
}
export declare function toLineRange(range: LineRange): MergeEditorLineRange;
export declare function toRangeMapping(mapping: DiffRangeMapping): RangeMapping;
