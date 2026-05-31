
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Emitter } from '../../../../base/common/event.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { LineRange } from '../../../common/core/ranges/lineRange.js';
import { DetailedLineRangeMapping, RangeMapping } from '../../../common/diff/rangeMapping.js';
import { IEditorWorkerService } from '../../../common/services/editorWorker.service.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.service.js';

var WorkerBasedDocumentDiffProvider_1;
let WorkerBasedDiffProviderFactoryService = class WorkerBasedDiffProviderFactoryService {
    constructor(instantiationService) {
        this.instantiationService = instantiationService;
    }
    createDiffProvider(options) {
        return this.instantiationService.createInstance(WorkerBasedDocumentDiffProvider, options);
    }
};
WorkerBasedDiffProviderFactoryService = ( __decorate([( __param(0, IInstantiationService))], WorkerBasedDiffProviderFactoryService));
let WorkerBasedDocumentDiffProvider = class WorkerBasedDocumentDiffProvider {
    static {
        WorkerBasedDocumentDiffProvider_1 = this;
    }
    static {
        this.diffCache = ( new Map());
    }
    constructor(options, editorWorkerService, telemetryService) {
        this.editorWorkerService = editorWorkerService;
        this.telemetryService = telemetryService;
        this.onDidChangeEventEmitter = ( new Emitter());
        this.onDidChange = this.onDidChangeEventEmitter.event;
        this.diffAlgorithm = "advanced";
        this.diffAlgorithmOnDidChangeSubscription = undefined;
        this.setOptions(options);
    }
    dispose() {
        this.diffAlgorithmOnDidChangeSubscription?.dispose();
        this.onDidChangeEventEmitter.dispose();
    }
    async computeDiff(original, modified, options, cancellationToken) {
        if (typeof this.diffAlgorithm !== "string") {
            return this.diffAlgorithm.computeDiff(original, modified, options, cancellationToken);
        }
        if (original.isDisposed() || modified.isDisposed()) {
            return {
                changes: [],
                identical: true,
                quitEarly: false,
                moves: []
            };
        }
        if (original.getLineCount() === 1 && original.getLineMaxColumn(1) === 1) {
            if (modified.getLineCount() === 1 && modified.getLineMaxColumn(1) === 1) {
                return {
                    changes: [],
                    identical: true,
                    quitEarly: false,
                    moves: []
                };
            }
            return {
                changes: [( new DetailedLineRangeMapping(( new LineRange(1, 2)), ( new LineRange(1, modified.getLineCount() + 1)), [( new RangeMapping(original.getFullModelRange(), modified.getFullModelRange()))]))],
                identical: false,
                quitEarly: false,
                moves: []
            };
        }
        const uriKey = JSON.stringify([( original.uri.toString()), ( modified.uri.toString())]);
        const context = JSON.stringify([
            original.id,
            modified.id,
            original.getAlternativeVersionId(),
            modified.getAlternativeVersionId(),
            JSON.stringify(options)
        ]);
        const c = WorkerBasedDocumentDiffProvider_1.diffCache.get(uriKey);
        if (c && c.context === context) {
            return c.result;
        }
        const sw = StopWatch.create();
        const result = await this.editorWorkerService.computeDiff(original.uri, modified.uri, options, this.diffAlgorithm);
        const timeMs = sw.elapsed();
        this.telemetryService.publicLog2("diffEditor.computeDiff", {
            timeMs,
            timedOut: result?.quitEarly ?? true,
            detectedMoves: options.computeMoves ? (result?.moves.length ?? 0) : -1
        });
        if (cancellationToken.isCancellationRequested) {
            return {
                changes: [],
                identical: false,
                quitEarly: true,
                moves: []
            };
        }
        if (!result) {
            throw ( new Error("no diff result available"));
        }
        if (WorkerBasedDocumentDiffProvider_1.diffCache.size > 10) {
            WorkerBasedDocumentDiffProvider_1.diffCache.delete(( WorkerBasedDocumentDiffProvider_1.diffCache.keys()).next().value);
        }
        WorkerBasedDocumentDiffProvider_1.diffCache.set(uriKey, {
            result,
            context
        });
        return result;
    }
    setOptions(newOptions) {
        let didChange = false;
        if (newOptions.diffAlgorithm) {
            if (this.diffAlgorithm !== newOptions.diffAlgorithm) {
                this.diffAlgorithmOnDidChangeSubscription?.dispose();
                this.diffAlgorithmOnDidChangeSubscription = undefined;
                this.diffAlgorithm = newOptions.diffAlgorithm;
                if (typeof newOptions.diffAlgorithm !== "string") {
                    this.diffAlgorithmOnDidChangeSubscription = newOptions.diffAlgorithm.onDidChange(() => this.onDidChangeEventEmitter.fire());
                }
                didChange = true;
            }
        }
        if (didChange) {
            this.onDidChangeEventEmitter.fire();
        }
    }
};
WorkerBasedDocumentDiffProvider = WorkerBasedDocumentDiffProvider_1 = ( __decorate([( __param(1, IEditorWorkerService)), ( __param(2, ITelemetryService))], WorkerBasedDocumentDiffProvider));

export { WorkerBasedDiffProviderFactoryService, WorkerBasedDocumentDiffProvider };
