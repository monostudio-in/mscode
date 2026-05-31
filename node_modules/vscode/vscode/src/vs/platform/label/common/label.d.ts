export declare enum Verbosity {
    SHORT = 0,
    MEDIUM = 1,
    LONG = 2
}
export interface IFormatterChangeEvent {
    scheme: string;
}
export interface ResourceLabelFormatter {
    scheme: string;
    authority?: string;
    priority?: boolean;
    formatting: ResourceLabelFormatting;
}
export interface ResourceLabelFormatting {
    label: string;
    separator: "/" | "\\" | "";
    tildify?: boolean;
    normalizeDriveLetter?: boolean;
    workspaceSuffix?: string;
    workspaceTooltip?: string;
    authorityPrefix?: string;
    stripPathStartingSeparator?: boolean;
    /**
     * Number of leading path segments to strip from `${path}` before
     * substitution. For example, a value of `2` turns
     * `/scheme/authority/rest/of/path` into `/rest/of/path`.
     */
    stripPathSegments?: number;
}
