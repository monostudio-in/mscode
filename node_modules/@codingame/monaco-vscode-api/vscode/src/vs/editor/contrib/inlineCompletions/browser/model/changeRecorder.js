
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import '../../../../../base/common/observableInternal/index.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { canLog, LogLevel } from '../../../../../platform/log/common/log.js';
import { ILoggerService } from '../../../../../platform/log/common/log.service.js';
import { CodeEditorWidget } from '../../../../browser/widget/codeEditor/codeEditorWidget.js';
import { StructuredLogger } from '../structuredLogger.js';
import { observableFromEvent } from '../../../../../base/common/observableInternal/observables/observableFromEvent.js';
import { autorun } from '../../../../../base/common/observableInternal/reactions/autorun.js';

let TextModelChangeRecorder = class TextModelChangeRecorder extends Disposable {
    constructor(_editor, _instantiationService, _loggerService) {
        super();
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._loggerService = _loggerService;
        this._structuredLogger = this._register(
            this._instantiationService.createInstance(StructuredLogger.cast(), "editor.inlineSuggest.logChangeReason.commandId")
        );
        const logger = this._loggerService?.createLogger("textModelChanges", {
            hidden: false,
            name: "Text Model Changes Reason"
        });
        const loggingLevel = observableFromEvent(this, logger.onDidChangeLogLevel, () => logger.getLevel());
        this._register(autorun(reader => {
            if (!canLog(loggingLevel.read(reader), LogLevel.Trace)) {
                return;
            }
            reader.store.add(this._editor.onDidChangeModelContent(e => {
                if (this._editor.getModel()?.uri.scheme === "output") {
                    return;
                }
                logger.trace("onDidChangeModelContent: " + ( e.detailedReasons.map(r => r.toKey(Number.MAX_VALUE))).join(", "));
            }));
        }));
        this._register(autorun(reader => {
            if (!(this._editor instanceof CodeEditorWidget)) {
                return;
            }
            if (!this._structuredLogger.isEnabled.read(reader)) {
                return;
            }
            reader.store.add(this._editor.onDidChangeModelContent(e => {
                const tm = this._editor.getModel();
                if (!tm) {
                    return;
                }
                const reason = e.detailedReasons[0];
                const data = {
                    ...reason.metadata,
                    sourceId: "TextModel.setChangeReason",
                    source: reason.metadata.source,
                    time: Date.now(),
                    modelUri: tm.uri,
                    modelVersion: tm.getVersionId()
                };
                setTimeout(() => {
                    this._structuredLogger.log(data);
                }, 0);
            }));
        }));
    }
};
TextModelChangeRecorder = ( __decorate([( __param(1, IInstantiationService)), ( __param(2, ILoggerService))], TextModelChangeRecorder));

export { TextModelChangeRecorder };
