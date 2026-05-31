
import { CancellationError } from '../../errors.js';
import '../../cancellation.js';
import '../../equals.js';
import '../../event.js';
import '../../lifecycle.js';
import { autorun } from '../reactions/autorun.js';
import '../observables/derivedImpl.js';
import '../debugLocation.js';

function waitForState(observable, predicate, isError, cancellationToken) {
    if (!predicate) {
        predicate = state => state !== null && state !== undefined;
    }
    return ( new Promise((resolve, reject) => {
        let isImmediateRun = true;
        let shouldDispose = false;
        const stateObs = ( observable.map(state => {
            return {
                isFinished: predicate(state),
                error: isError ? isError(state) : false,
                state
            };
        }));
        const d = autorun(reader => {
            const {
                isFinished,
                error,
                state
            } = stateObs.read(reader);
            if (isFinished || error) {
                if (isImmediateRun) {
                    shouldDispose = true;
                } else {
                    d.dispose();
                }
                if (error) {
                    reject(error === true ? state : error);
                } else {
                    resolve(state);
                }
            }
        });
        if (cancellationToken) {
            const dc = cancellationToken.onCancellationRequested(() => {
                d.dispose();
                dc.dispose();
                reject(( new CancellationError()));
            });
            if (cancellationToken.isCancellationRequested) {
                d.dispose();
                dc.dispose();
                reject(( new CancellationError()));
                return;
            }
        }
        isImmediateRun = false;
        if (shouldDispose) {
            d.dispose();
        }
    }));
}

export { waitForState };
