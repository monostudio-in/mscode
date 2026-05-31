import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { TextAreaEditContext } from "./textAreaEditContext.js";
declare class TextAreaEditContextRegistryImpl {
    private _textAreaEditContextMapping;
    register(ownerID: string, textAreaEditContext: TextAreaEditContext): IDisposable;
    get(ownerID: string): TextAreaEditContext | undefined;
}
export declare const TextAreaEditContextRegistry: TextAreaEditContextRegistryImpl;
export {};
