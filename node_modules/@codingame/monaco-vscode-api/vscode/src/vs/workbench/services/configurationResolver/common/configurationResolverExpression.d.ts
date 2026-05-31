import { ConfiguredInput } from "./configurationResolver.js";
/** A replacement found in the object, as ${name} or ${name:arg} */
export type Replacement = {
    /** ${name:arg} */
    id: string;
    /** The `name:arg` in ${name:arg} */
    inner: string;
    /** The `name` in ${name:arg} */
    name: string;
    /** The `arg` in ${name:arg} */
    arg?: string;
};
interface IConfigurationResolverExpression<T> {
    /**
     * Gets the replacements which have not yet been
     * resolved.
     */
    unresolved(): Iterable<Replacement>;
    /**
     * Gets the replacements which have been resolved.
     */
    resolved(): Iterable<[
        Replacement,
        IResolvedValue
    ]>;
    /**
     * Resolves a replacement into the string value.
     * If the value is undefined, the original variable text will be preserved.
     */
    resolve(replacement: Replacement, data: string | IResolvedValue): void;
    /**
     * Returns the complete object. Any unresolved replacements are left intact.
     */
    toObject(): T;
}
export interface IResolvedValue {
    value: string | undefined;
    /** Present when the variable is resolved from an input field. */
    input?: ConfiguredInput;
}
export declare class ConfigurationResolverExpression<T> implements IConfigurationResolverExpression<T> {
    static readonly VARIABLE_LHS = "${";
    private readonly locations;
    private root;
    private stringRoot;
    /**
     * Callbacks when a new replacement is made, so that nested resolutions from
     * `expr.unresolved()` can be fulfilled in the same iteration.
     */
    private newReplacementNotifiers;
    private constructor();
    /**
     * Creates a new {@link ConfigurationResolverExpression} from an object.
     * Note that platform-specific keys (i.e. `windows`, `osx`, `linux`) are
     * applied during parsing.
     */
    static parse<T>(object: T): ConfigurationResolverExpression<T>;
    private applyPlatformSpecificKeys;
    private parseVariable;
    private parseObject;
    private parseString;
    unresolved(): Iterable<Replacement>;
    resolved(): Iterable<[
        Replacement,
        IResolvedValue
    ]>;
    resolve(replacement: Replacement, data: string | IResolvedValue): void;
    private _resolveAtLocation;
    private _renameKeyInLocations;
    toObject(): T;
}
export {};
