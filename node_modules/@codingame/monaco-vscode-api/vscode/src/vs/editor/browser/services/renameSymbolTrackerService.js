
import '../../../base/common/observableInternal/index.js';
import { observableValue } from '../../../base/common/observableInternal/observables/observableValue.js';

class NullRenameSymbolTrackerService {
    constructor() {
        this._trackedWord = observableValue(this, undefined);
        this.trackedWord = this._trackedWord;
        this._trackedWord.set(undefined, undefined);
    }
}

export { NullRenameSymbolTrackerService };
