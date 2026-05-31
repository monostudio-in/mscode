
import { handleBugIndicatingErrorRecovery } from './base.js';
import { getFunctionName } from './debugName.js';
import { getLogger } from './logging/logging.js';

function transaction(fn, getDebugName) {
    const tx = ( new TransactionImpl(fn, getDebugName));
    try {
        fn(tx);
    } finally {
        tx.finish();
    }
}
let _globalTransaction = undefined;
function globalTransaction(fn) {
    if (_globalTransaction) {
        fn(_globalTransaction);
    } else {
        const tx = ( new TransactionImpl(fn, undefined));
        _globalTransaction = tx;
        try {
            fn(tx);
        } finally {
            tx.finish();
            _globalTransaction = undefined;
        }
    }
}
async function asyncTransaction(fn, getDebugName) {
    const tx = ( new TransactionImpl(fn, getDebugName));
    try {
        await fn(tx);
    } finally {
        tx.finish();
    }
}
function subtransaction(tx, fn, getDebugName) {
    if (!tx) {
        transaction(fn, getDebugName);
    } else {
        fn(tx);
    }
}
class TransactionImpl {
    constructor(_fn, _getDebugName) {
        this._fn = _fn;
        this._getDebugName = _getDebugName;
        this._updatingObservers = [];
        getLogger()?.handleBeginTransaction(this);
    }
    getDebugName() {
        if (this._getDebugName) {
            return this._getDebugName();
        }
        return getFunctionName(this._fn);
    }
    updateObserver(observer, observable) {
        if (!this._updatingObservers) {
            handleBugIndicatingErrorRecovery("Transaction already finished!");
            transaction(tx => {
                tx.updateObserver(observer, observable);
            });
            return;
        }
        this._updatingObservers.push({
            observer,
            observable
        });
        observer.beginUpdate(observable);
    }
    finish() {
        const updatingObservers = this._updatingObservers;
        if (!updatingObservers) {
            handleBugIndicatingErrorRecovery("transaction.finish() has already been called!");
            return;
        }
        for (let i = 0; i < updatingObservers.length; i++) {
            const {
                observer,
                observable
            } = updatingObservers[i];
            observer.endUpdate(observable);
        }
        this._updatingObservers = null;
        getLogger()?.handleEndTransaction(this);
    }
    debugGetUpdatingObservers() {
        return this._updatingObservers;
    }
}

export { TransactionImpl, asyncTransaction, globalTransaction, subtransaction, transaction };
