import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICommandDetectionCapability, ITerminalCapabilityImplMap, ITerminalCapabilityStore, TerminalCapability, type AnyTerminalCapabilityChangeEvent, type ICwdDetectionCapability } from "./capabilities.js";
export declare class TerminalCapabilityStore extends Disposable implements ITerminalCapabilityStore {
    private _map;
    private readonly _onDidAddCapability;
    get onDidAddCapability(): Event<AnyTerminalCapabilityChangeEvent>;
    private readonly _onDidRemoveCapability;
    get onDidRemoveCapability(): Event<AnyTerminalCapabilityChangeEvent>;
    get onDidChangeCapabilities(): Event<undefined>;
    get onDidAddCommandDetectionCapability(): Event<ICommandDetectionCapability>;
    get onDidRemoveCommandDetectionCapability(): Event<undefined>;
    get onDidAddCwdDetectionCapability(): Event<ICwdDetectionCapability>;
    get onDidRemoveCwdDetectionCapability(): Event<undefined>;
    get items(): IterableIterator<TerminalCapability>;
    createOnDidRemoveCapabilityOfTypeEvent<T extends TerminalCapability>(type: T): Event<ITerminalCapabilityImplMap[T]>;
    createOnDidAddCapabilityOfTypeEvent<T extends TerminalCapability>(type: T): Event<ITerminalCapabilityImplMap[T]>;
    add<T extends TerminalCapability>(capability: T, impl: ITerminalCapabilityImplMap[T]): void;
    get<T extends TerminalCapability>(capability: T): ITerminalCapabilityImplMap[T] | undefined;
    remove(capability: TerminalCapability): void;
    has(capability: TerminalCapability): boolean;
}
export declare class TerminalCapabilityStoreMultiplexer extends Disposable implements ITerminalCapabilityStore {
    readonly _stores: ITerminalCapabilityStore[];
    private readonly _onDidAddCapability;
    get onDidAddCapability(): Event<AnyTerminalCapabilityChangeEvent>;
    private readonly _onDidRemoveCapability;
    get onDidRemoveCapability(): Event<AnyTerminalCapabilityChangeEvent>;
    get onDidChangeCapabilities(): Event<undefined>;
    get onDidAddCommandDetectionCapability(): Event<ICommandDetectionCapability>;
    get onDidRemoveCommandDetectionCapability(): Event<undefined>;
    get onDidAddCwdDetectionCapability(): Event<ICwdDetectionCapability>;
    get onDidRemoveCwdDetectionCapability(): Event<undefined>;
    get items(): IterableIterator<TerminalCapability>;
    createOnDidRemoveCapabilityOfTypeEvent<T extends TerminalCapability>(type: T): Event<ITerminalCapabilityImplMap[T]>;
    createOnDidAddCapabilityOfTypeEvent<T extends TerminalCapability>(type: T): Event<ITerminalCapabilityImplMap[T]>;
    private _items;
    has(capability: TerminalCapability): boolean;
    get<T extends TerminalCapability>(capability: T): ITerminalCapabilityImplMap[T] | undefined;
    add(store: ITerminalCapabilityStore): void;
}
