
import { createCancelableAsyncIterableProducer, RunOnceScheduler } from '../../../../base/common/async.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { EditorOption } from '../../../common/config/editorOptions.js';

var HoverOperationState;
(function(HoverOperationState) {
    HoverOperationState[HoverOperationState["Idle"] = 0] = "Idle";
    HoverOperationState[HoverOperationState["FirstWait"] = 1] = "FirstWait";
    HoverOperationState[HoverOperationState["SecondWait"] = 2] = "SecondWait";
    HoverOperationState[HoverOperationState["WaitingForAsync"] = 3] = "WaitingForAsync";
    HoverOperationState[HoverOperationState["WaitingForAsyncShowingLoading"] = 4] = "WaitingForAsyncShowingLoading";
})(HoverOperationState || (HoverOperationState = {}));
var HoverStartMode;
(function(HoverStartMode) {
    HoverStartMode[HoverStartMode["Delayed"] = 0] = "Delayed";
    HoverStartMode[HoverStartMode["Immediate"] = 1] = "Immediate";
})(HoverStartMode || (HoverStartMode = {}));
var HoverStartSource;
(function(HoverStartSource) {
    HoverStartSource[HoverStartSource["Mouse"] = 0] = "Mouse";
    HoverStartSource[HoverStartSource["Click"] = 1] = "Click";
    HoverStartSource[HoverStartSource["Keyboard"] = 2] = "Keyboard";
})(HoverStartSource || (HoverStartSource = {}));
class HoverResult {
    constructor(value, isComplete, hasLoadingMessage, options) {
        this.value = value;
        this.isComplete = isComplete;
        this.hasLoadingMessage = hasLoadingMessage;
        this.options = options;
    }
}
class HoverOperation extends Disposable {
    constructor(_editor, _computer) {
        super();
        this._editor = _editor;
        this._computer = _computer;
        this._onResult = this._register(( new Emitter()));
        this.onResult = this._onResult.event;
        this._asyncComputationScheduler = this._register(( new Debouncer(options => this._triggerAsyncComputation(options), 0)));
        this._syncComputationScheduler = this._register(( new Debouncer(options => this._triggerSyncComputation(options), 0)));
        this._loadingMessageScheduler = this._register(( new Debouncer(options => this._triggerLoadingMessage(options), 0)));
        this._state = HoverOperationState.Idle;
        this._asyncIterable = null;
        this._asyncIterableDone = false;
        this._result = [];
    }
    dispose() {
        if (this._asyncIterable) {
            this._asyncIterable.cancel();
            this._asyncIterable = null;
        }
        this._options = undefined;
        super.dispose();
    }
    get _hoverTime() {
        return this._editor.getOption(EditorOption.hover).delay;
    }
    get _firstWaitTime() {
        return this._hoverTime / 2;
    }
    get _secondWaitTime() {
        return this._hoverTime - this._firstWaitTime;
    }
    get _loadingMessageTime() {
        return 3 * this._hoverTime;
    }
    _setState(state, options) {
        this._options = options;
        this._state = state;
        this._fireResult(options);
    }
    _triggerAsyncComputation(options) {
        this._setState(HoverOperationState.SecondWait, options);
        this._syncComputationScheduler.schedule(options, this._secondWaitTime);
        if (this._computer.computeAsync) {
            this._asyncIterableDone = false;
            this._asyncIterable = createCancelableAsyncIterableProducer(token => this._computer.computeAsync(options, token));
            (async () => {
                try {
                    for await (const item of this._asyncIterable) {
                        if (item) {
                            this._result.push(item);
                            this._fireResult(options);
                        }
                    }
                    this._asyncIterableDone = true;
                    if (this._state === HoverOperationState.WaitingForAsync || this._state === HoverOperationState.WaitingForAsyncShowingLoading) {
                        this._setState(HoverOperationState.Idle, options);
                    }
                } catch (e) {
                    onUnexpectedError(e);
                }
            })();
        } else {
            this._asyncIterableDone = true;
        }
    }
    _triggerSyncComputation(options) {
        if (this._computer.computeSync) {
            this._result = this._result.concat(this._computer.computeSync(options));
        }
        this._setState(
            this._asyncIterableDone ? HoverOperationState.Idle : HoverOperationState.WaitingForAsync,
            options
        );
    }
    _triggerLoadingMessage(options) {
        if (this._state === HoverOperationState.WaitingForAsync) {
            this._setState(HoverOperationState.WaitingForAsyncShowingLoading, options);
        }
    }
    _fireResult(options) {
        if (this._state === HoverOperationState.FirstWait || this._state === HoverOperationState.SecondWait) {
            return;
        }
        const isComplete = (this._state === HoverOperationState.Idle);
        const hasLoadingMessage = (this._state === HoverOperationState.WaitingForAsyncShowingLoading);
        this._onResult.fire(( new HoverResult(this._result.slice(0), isComplete, hasLoadingMessage, options)));
    }
    start(mode, options) {
        if (mode === HoverStartMode.Delayed) {
            if (this._state === HoverOperationState.Idle) {
                this._setState(HoverOperationState.FirstWait, options);
                this._asyncComputationScheduler.schedule(options, this._firstWaitTime);
                this._loadingMessageScheduler.schedule(options, this._loadingMessageTime);
            }
        } else {
            switch (this._state) {
            case HoverOperationState.Idle:
                this._triggerAsyncComputation(options);
                this._syncComputationScheduler.cancel();
                this._triggerSyncComputation(options);
                break;
            case HoverOperationState.SecondWait:
                this._syncComputationScheduler.cancel();
                this._triggerSyncComputation(options);
                break;
            }
        }
    }
    cancel() {
        this._asyncComputationScheduler.cancel();
        this._syncComputationScheduler.cancel();
        this._loadingMessageScheduler.cancel();
        if (this._asyncIterable) {
            this._asyncIterable.cancel();
            this._asyncIterable = null;
        }
        this._result = [];
        this._options = undefined;
        this._state = HoverOperationState.Idle;
    }
    get options() {
        return this._options;
    }
}
class Debouncer extends Disposable {
    constructor(runner, debounceTimeMs) {
        super();
        this._scheduler = this._register(( new RunOnceScheduler(() => runner(this._options), debounceTimeMs)));
    }
    schedule(options, debounceTimeMs) {
        this._options = options;
        this._scheduler.schedule(debounceTimeMs);
    }
    cancel() {
        this._scheduler.cancel();
    }
}

export { HoverOperation, HoverResult, HoverStartMode, HoverStartSource };
