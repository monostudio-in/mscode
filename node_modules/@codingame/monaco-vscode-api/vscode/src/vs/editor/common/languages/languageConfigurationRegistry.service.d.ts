import { Event } from "../../../base/common/event.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { LanguageConfiguration } from "./languageConfiguration.js";
import { LanguageConfigurationServiceChangeEvent, ResolvedLanguageConfiguration } from "./languageConfigurationRegistry.js";
export declare const ILanguageConfigurationService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageConfigurationService>;
export interface ILanguageConfigurationService {
    readonly _serviceBrand: undefined;
    readonly onDidChange: Event<LanguageConfigurationServiceChangeEvent>;
    /**
    * @param priority Use a higher number for higher priority
    */
    register(languageId: string, configuration: LanguageConfiguration, priority?: number): IDisposable;
    getLanguageConfiguration(languageId: string): ResolvedLanguageConfiguration;
}
