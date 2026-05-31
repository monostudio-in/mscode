export interface IDebugParams {
    port: number | null;
    break: boolean;
}
export interface IExtensionHostDebugParams extends IDebugParams {
    debugId?: string;
    env?: Record<string, string>;
}
/**
 * Type of extension.
 *
 * **NOTE**: This is defined in `platform/environment` because it can appear as a CLI argument.
 */
export type ExtensionKind = "ui" | "workspace" | "web";
