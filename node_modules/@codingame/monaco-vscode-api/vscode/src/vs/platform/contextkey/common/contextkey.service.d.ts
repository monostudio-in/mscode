import { Event } from "../../../base/common/event.js";
import { IContextKeyChangeEvent, ContextKeyValue, IContextKey, ContextKeyExpression, IContextKeyServiceTarget, IScopedContextKeyService, IContext } from "./contextkey.js";
export declare const IContextKeyService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IContextKeyService>;
export interface IContextKeyService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeContext: Event<IContextKeyChangeEvent>;
    bufferChangeEvents(callback: Function): void;
    createKey<T extends ContextKeyValue>(key: string, defaultValue: T | undefined): IContextKey<T>;
    contextMatchesRules(rules: ContextKeyExpression | undefined): boolean;
    getContextKeyValue<T>(key: string): T | undefined;
    createScoped(target: IContextKeyServiceTarget): IScopedContextKeyService;
    createOverlay(overlay: Iterable<[
        string,
        any
    ]>): IContextKeyService;
    getContext(target: IContextKeyServiceTarget | null): IContext;
    updateParent(parentContextKeyService: IContextKeyService): void;
}
