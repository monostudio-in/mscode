
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { toDisposable } from '../../../../../base/common/lifecycle.js';
import '../../../../../base/common/observableInternal/index.js';
import { compare } from '../../../../../base/common/strings.js';
import { isObject } from '../../../../../base/common/types.js';
import { derived } from '../../../../../base/common/observableInternal/observables/derived.js';
import { ObservablePromise } from '../../../../../base/common/observableInternal/utils/promise.js';

function isChatContextPickerPickItem(item) {
    return isObject(item) && typeof item.asAttachment === "function";
}
function picksWithPromiseFn(fn) {
    return (query, token) => {
        const promise = derived(reader => {
            const queryValue = query.read(reader);
            const cts = ( new CancellationTokenSource(token));
            reader.store.add(toDisposable(() => cts.dispose(true)));
            return ( new ObservablePromise(fn(queryValue, cts.token)));
        });
        return ( promise.map((value, reader) => {
            const result = value.promiseResult.read(reader);
            return {
                picks: result?.data || [],
                busy: result === undefined
            };
        }));
    };
}
class ChatContextPickService {
    constructor() {
        this._picks = [];
        this.items = this._picks;
    }
    registerChatContextItem(pick) {
        this._picks.push(pick);
        this._picks.sort((a, b) => {
            const valueA = a.ordinal ?? 0;
            const valueB = b.ordinal ?? 0;
            if (valueA === valueB) {
                return compare(a.label, b.label);
            } else if (valueA < valueB) {
                return 1;
            } else {
                return -1;
            }
        });
        return toDisposable(() => {
            const index = this._picks.indexOf(pick);
            if (index >= 0) {
                this._picks.splice(index, 1);
            }
        });
    }
}

export { ChatContextPickService, isChatContextPickerPickItem, picksWithPromiseFn };
