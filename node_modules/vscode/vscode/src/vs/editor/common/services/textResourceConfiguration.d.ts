import { URI } from "../../../base/common/uri.js";
export interface ITextResourceConfigurationChangeEvent {
    /**
     * All affected keys. Also includes language overrides and keys changed under language overrides.
     */
    readonly affectedKeys: ReadonlySet<string>;
    /**
     * Returns `true` if the given section has changed for the given resource.
     *
     * Example: To check if the configuration section has changed for a given resource use `e.affectsConfiguration(resource, section)`.
     *
     * @param resource Resource for which the configuration has to be checked.
     * @param section Section of the configuration
     */
    affectsConfiguration(resource: URI | undefined, section: string): boolean;
}
