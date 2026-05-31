import { IObservable } from "../../../../../base/common/observable.js";
export declare const IChatLayoutService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatLayoutService>;
export interface IChatLayoutService {
    readonly _serviceBrand: undefined;
    readonly fontFamily: IObservable<string | null>;
    readonly fontSize: IObservable<number>;
}
