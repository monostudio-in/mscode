
import { DebugNameData } from '../debugName.js';
import '../../errors.js';
import { strictEquals } from '../../equals.js';
import '../../event.js';
import '../../lifecycle.js';
import { ObservableValue } from './observableValue.js';
import { LazyObservableValue } from './lazyObservableValue.js';
import { DebugLocation } from '../debugLocation.js';

function observableValueOpts(options, initialValue, debugLocation = DebugLocation.ofCaller()) {
    if (options.lazy) {
        return ( new LazyObservableValue(( new DebugNameData(options.owner, options.debugName, undefined)), initialValue, options.equalsFn ?? strictEquals, debugLocation));
    }
    return ( new ObservableValue(( new DebugNameData(options.owner, options.debugName, undefined)), initialValue, options.equalsFn ?? strictEquals, debugLocation));
}

export { observableValueOpts };
