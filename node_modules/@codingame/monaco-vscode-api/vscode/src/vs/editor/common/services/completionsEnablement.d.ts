import { IConfigurationService } from "../../../platform/configuration/common/configuration.service.js";
import { ITextResourceConfigurationService } from "./textResourceConfiguration.service.js";
import { URI } from "../../../base/common/uri.js";
/**
 * Checks if completions (e.g., Copilot) are enabled for a given language ID
 * using `IConfigurationService`.
 *
 * @param configurationService The configuration service to read settings from.
 * @param modeId The language ID to check. Defaults to '*' which checks the global setting.
 * @returns `true` if completions are enabled for the language, `false` otherwise.
 */
export declare function isCompletionsEnabled(configurationService: IConfigurationService, modeId?: string): boolean;
/**
 * Checks if completions (e.g., Copilot) are enabled for a given language ID
 * using `ITextResourceConfigurationService`.
 *
 * @param configurationService The text resource configuration service to read settings from.
 * @param modeId The language ID to check. Defaults to '*' which checks the global setting.
 * @returns `true` if completions are enabled for the language, `false` otherwise.
 */
export declare function isCompletionsEnabledWithTextResourceConfig(configurationService: ITextResourceConfigurationService, resource: URI, modeId?: string): boolean;
/**
 * Checks if completions are enabled for a given language ID using a pre-fetched
 * completions enablement object.
 *
 * @param completionsEnablementObject The object containing per-language enablement settings.
 * @param modeId The language ID to check. Defaults to '*' which checks the global setting.
 * @returns `true` if completions are enabled for the language, `false` otherwise.
 */
export declare function isCompletionsEnabledFromObject(completionsEnablementObject: Record<string, boolean> | undefined, modeId?: string): boolean;
