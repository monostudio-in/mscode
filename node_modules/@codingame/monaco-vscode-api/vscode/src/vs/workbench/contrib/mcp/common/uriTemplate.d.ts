export interface IUriTemplateVariable {
    readonly explodable: boolean;
    readonly name: string;
    readonly optional: boolean;
    readonly prefixLength?: number;
    readonly repeatable: boolean;
}
interface IUriTemplateComponent {
    readonly expression: string;
    readonly operator: string;
    readonly variables: readonly IUriTemplateVariable[];
}
/**
 * Represents an RFC 6570 URI Template.
 */
export declare class UriTemplate {
    readonly template: string;
    /**
     * The parsed template components (expressions).
     */
    readonly components: ReadonlyArray<IUriTemplateComponent | string>;
    private constructor();
    /**
     * Parses a URI template string into a UriTemplate instance.
     */
    static parse(template: string): UriTemplate;
    private static _operators;
    private static _isOperator;
    /**
     * Resolves the template with the given variables.
     */
    resolve(variables: Record<string, unknown>): string;
    private _expand;
    private static _encode;
    private static _formPair;
}
export {};
