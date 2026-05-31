
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { DeferredPromise } from '../../../base/common/async.js';
import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import { Disposable, toDisposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { IProgressService } from './progress.service.js';

var ProgressLocation;
(function(ProgressLocation) {
    ProgressLocation[ProgressLocation["Explorer"] = 1] = "Explorer";
    ProgressLocation[ProgressLocation["Scm"] = 3] = "Scm";
    ProgressLocation[ProgressLocation["Extensions"] = 5] = "Extensions";
    ProgressLocation[ProgressLocation["Window"] = 10] = "Window";
    ProgressLocation[ProgressLocation["Notification"] = 15] = "Notification";
    ProgressLocation[ProgressLocation["Dialog"] = 20] = "Dialog";
})(ProgressLocation || (ProgressLocation = {}));
const emptyProgressRunner = ( Object.freeze({
    total() {},
    worked() {},
    done() {}
}));
class Progress {
    static {
        this.None = ( Object.freeze({
            report() {}
        }));
    }
    get value() {
        return this._value;
    }
    constructor(callback) {
        this.callback = callback;
    }
    report(item) {
        this._value = item;
        this.callback(this._value);
    }
}
let UnmanagedProgress = class UnmanagedProgress extends Disposable {
    constructor(options, progressService) {
        super();
        this.deferred = ( new DeferredPromise());
        progressService.withProgress(options, reporter => {
            this.reporter = reporter;
            if (this.lastStep) {
                reporter.report(this.lastStep);
            }
            return this.deferred.p;
        });
        this._register(toDisposable(() => this.deferred.complete()));
    }
    report(step) {
        if (this.reporter) {
            this.reporter.report(step);
        } else {
            this.lastStep = step;
        }
    }
};
UnmanagedProgress = ( __decorate([( __param(1, IProgressService))], UnmanagedProgress));
class LongRunningOperation extends Disposable {
    constructor(progressIndicator) {
        super();
        this.progressIndicator = progressIndicator;
        this.currentOperationId = 0;
        this.currentOperationDisposables = this._register(( new DisposableStore()));
        this.currentProgressTimeout = undefined;
    }
    start(progressDelay) {
        this.stop();
        const newOperationId = ++this.currentOperationId;
        const newOperationToken = ( new CancellationTokenSource());
        this.currentProgressTimeout = setTimeout(() => {
            if (newOperationId === this.currentOperationId) {
                this.currentProgressRunner = this.progressIndicator.show(true);
            }
        }, progressDelay);
        this.currentOperationDisposables.add(toDisposable(() => clearTimeout(this.currentProgressTimeout)));
        this.currentOperationDisposables.add(toDisposable(() => newOperationToken.cancel()));
        this.currentOperationDisposables.add(toDisposable(
            () => this.currentProgressRunner ? this.currentProgressRunner.done() : undefined
        ));
        return {
            id: newOperationId,
            token: newOperationToken.token,
            stop: () => this.doStop(newOperationId),
            isCurrent: () => this.currentOperationId === newOperationId
        };
    }
    stop() {
        this.doStop(this.currentOperationId);
    }
    doStop(operationId) {
        if (this.currentOperationId === operationId) {
            this.currentOperationDisposables.clear();
        }
    }
}

export { LongRunningOperation, Progress, ProgressLocation, UnmanagedProgress, emptyProgressRunner };
