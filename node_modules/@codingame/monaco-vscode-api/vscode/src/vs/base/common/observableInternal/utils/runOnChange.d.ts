import { IObservableWithChange } from "../base.js";
import { CancellationToken } from "../commonFacade/cancellation.js";
import { DisposableStore, IDisposable } from "../commonFacade/deps.js";
export type RemoveUndefined<T> = T extends undefined ? never : T;
export declare function runOnChange<T, TChange>(observable: IObservableWithChange<T, TChange>, cb: (value: T, previousValue: T, deltas: RemoveUndefined<TChange>[]) => void): IDisposable;
export declare function runOnChangeWithStore<T, TChange>(observable: IObservableWithChange<T, TChange>, cb: (value: T, previousValue: T, deltas: RemoveUndefined<TChange>[], store: DisposableStore) => void): IDisposable;
export declare function runOnChangeWithCancellationToken<T, TChange>(observable: IObservableWithChange<T, TChange>, cb: (value: T, previousValue: T, deltas: RemoveUndefined<TChange>[], token: CancellationToken) => Promise<void>): IDisposable;
