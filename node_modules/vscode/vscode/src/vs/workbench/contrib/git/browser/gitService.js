
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { BugIndicatingError } from '../../../../base/common/errors.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import '../../../../base/common/observableInternal/index.js';
import { structuralEquals } from '../../../../base/common/equals.js';
import { AutoOpenBarrier } from '../../../../base/common/async.js';
import { ILogService } from '../../../../platform/log/common/log.service.js';
import { observableValueOpts } from '../../../../base/common/observableInternal/observables/observableValueOpts.js';

let GitService = class GitService extends Disposable {
    get repositories() {
        return this._delegate?.repositories ?? [];
    }
    constructor(logService) {
        super();
        this.logService = logService;
        this._delegateBarrier = ( new AutoOpenBarrier(10_000));
    }
    setDelegate(delegate) {
        if (this._delegate) {
            this.logService.error("[GitService][setDelegate] GitExtension delegate is already set.");
            throw ( new BugIndicatingError("GitExtension delegate is already set."));
        }
        this._delegate = delegate;
        this._delegateBarrier.open();
        return toDisposable(() => {
            this._delegate = undefined;
        });
    }
    async openRepository(uri) {
        await this._delegateBarrier.wait();
        if (!this._delegate) {
            this.logService.warn(
                "[GitService][openRepository] GitExtension delegate is not set after 10 seconds. Cannot open repository."
            );
            return undefined;
        }
        return this._delegate.openRepository(uri);
    }
};
GitService = ( __decorate([( __param(0, ILogService))], GitService));
class GitRepository extends Disposable {
    updateState(state) {
        this.state.set(state, undefined);
    }
    constructor(rootUri, initialState, delegate) {
        super();
        this.delegate = delegate;
        this.rootUri = rootUri;
        this.state = observableValueOpts({
            owner: this,
            equalsFn: structuralEquals
        }, initialState);
    }
    async getRefs(query, token) {
        return this.delegate.getRefs(this.rootUri, query, token);
    }
    async diffBetweenWithStats(ref1, ref2, path) {
        return this.delegate.diffBetweenWithStats(this.rootUri, ref1, ref2, path);
    }
    async diffBetweenWithStats2(ref, path) {
        return this.delegate.diffBetweenWithStats2(this.rootUri, ref, path);
    }
}

export { GitRepository, GitService };
