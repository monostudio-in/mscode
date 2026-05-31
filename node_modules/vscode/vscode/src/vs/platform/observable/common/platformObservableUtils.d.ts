import { IDisposable } from "../../../base/common/lifecycle.js";
import { DebugLocation, IObservable, IReader } from "../../../base/common/observable.js";
import { IConfigurationService } from "../../configuration/common/configuration.service.js";
import { ContextKeyValue, RawContextKey } from "../../contextkey/common/contextkey.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.service.js";
/** Creates an observable update when a configuration key updates. */
export declare function observableConfigValue<T>(key: string, defaultValue: T, configurationService: IConfigurationService, debugLocation?: DebugLocation): IObservable<T>;
/** Update the configuration key with a value derived from observables. */
export declare function bindContextKey<T extends ContextKeyValue>(key: RawContextKey<T>, service: IContextKeyService, computeValue: (reader: IReader) => T, debugLocation?: DebugLocation): IDisposable;
export declare function observableContextKey<T>(key: string, contextKeyService: IContextKeyService, debugLocation?: DebugLocation): IObservable<T | undefined>;
