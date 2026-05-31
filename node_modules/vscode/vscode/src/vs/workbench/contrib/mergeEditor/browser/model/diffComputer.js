
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { assertFn, checkAdjacentItems } from '../../../../../base/common/assert.js';
import { IEditorWorkerService } from '../../../../../editor/common/services/editorWorker.service.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.service.js';
import { MergeEditorLineRange } from './lineRange.js';
import { DetailedLineRangeMapping, RangeMapping } from './mapping.js';
import { observableConfigValue } from '../../../../../platform/observable/common/platformObservableUtils.js';

let MergeDiffComputer = class MergeDiffComputer {
    constructor(editorWorkerService, configurationService) {
        this.editorWorkerService = editorWorkerService;
        this.configurationService = configurationService;
        this.mergeAlgorithm = ( observableConfigValue("mergeEditor.diffAlgorithm", "advanced", this.configurationService).map(v => v === "smart" ? "legacy" : v === "experimental" ? "advanced" : v));
    }
    async computeDiff(textModel1, textModel2, reader) {
        const diffAlgorithm = this.mergeAlgorithm.read(reader);
        const inputVersion = textModel1.getVersionId();
        const outputVersion = textModel2.getVersionId();
        const result = await this.editorWorkerService.computeDiff(textModel1.uri, textModel2.uri, {
            ignoreTrimWhitespace: false,
            maxComputationTimeMs: 0,
            computeMoves: false
        }, diffAlgorithm);
        if (!result) {
            throw ( new Error("Diff computation failed"));
        }
        if (textModel1.isDisposed() || textModel2.isDisposed()) {
            return {
                diffs: null
            };
        }
        const changes = ( result.changes.map(c => ( new DetailedLineRangeMapping(
            toLineRange(c.original),
            textModel1,
            toLineRange(c.modified),
            textModel2,
            c.innerChanges?.map(ic => toRangeMapping(ic))
        ))));
        const newInputVersion = textModel1.getVersionId();
        const newOutputVersion = textModel2.getVersionId();
        if (inputVersion !== newInputVersion || outputVersion !== newOutputVersion) {
            return {
                diffs: null
            };
        }
        assertFn(() => {
            return changes.length === 0 || (changes[0].inputRange.startLineNumber === changes[0].outputRange.startLineNumber && checkAdjacentItems(
                changes,
                (m1, m2) => m2.inputRange.startLineNumber - m1.inputRange.endLineNumberExclusive === m2.outputRange.startLineNumber - m1.outputRange.endLineNumberExclusive &&
                m1.inputRange.endLineNumberExclusive < m2.inputRange.startLineNumber && m1.outputRange.endLineNumberExclusive < m2.outputRange.startLineNumber
            ));
        });
        return {
            diffs: changes
        };
    }
};
MergeDiffComputer = ( __decorate([( __param(0, IEditorWorkerService)), ( __param(1, IConfigurationService))], MergeDiffComputer));
function toLineRange(range) {
    return MergeEditorLineRange.fromLength(range.startLineNumber, range.length);
}
function toRangeMapping(mapping) {
    return ( new RangeMapping(mapping.originalRange, mapping.modifiedRange));
}

export { MergeDiffComputer, toLineRange, toRangeMapping };
