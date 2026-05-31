import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { NativeEditContext } from "./nativeEditContext.js";
declare class NativeEditContextRegistryImpl {
    private _nativeEditContextMapping;
    register(ownerID: string, nativeEditContext: NativeEditContext): IDisposable;
    get(ownerID: string): NativeEditContext | undefined;
}
export declare const NativeEditContextRegistry: NativeEditContextRegistryImpl;
export {};
