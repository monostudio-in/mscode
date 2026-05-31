

var LazyValueState;
(function(LazyValueState) {
    LazyValueState[LazyValueState["Uninitialized"] = 0] = "Uninitialized";
    LazyValueState[LazyValueState["Running"] = 1] = "Running";
    LazyValueState[LazyValueState["Completed"] = 2] = "Completed";
})(LazyValueState || (LazyValueState = {}));
class Lazy {
    constructor(executor) {
        this.executor = executor;
        this._state = LazyValueState.Uninitialized;
    }
    get hasValue() {
        return this._state === LazyValueState.Completed;
    }
    get value() {
        if (this._state === LazyValueState.Uninitialized) {
            this._state = LazyValueState.Running;
            try {
                this._value = this.executor();
            } catch (err) {
                this._error = err;
            } finally {
                this._state = LazyValueState.Completed;
            }
        } else if (this._state === LazyValueState.Running) {
            throw ( new Error("Cannot read the value of a lazy that is being initialized"));
        }
        if (this._error) {
            throw this._error;
        }
        return this._value;
    }
    get rawValue() {
        return this._value;
    }
}

export { Lazy };
