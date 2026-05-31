import { type IAnyWorkspaceIdentifier } from "./vscode/src/vs/platform/workspace/common/workspace.js";
import type { IWorkbenchConstructionOptions } from "./vscode/src/vs/workbench/browser/web.api.js";
import { URI } from "./vscode/src/vs/base/common/uri.js";
export interface EnvironmentOverride {
    userHome?: URI;
}
export declare const logsPath: URI;
export declare function getWorkbenchContainer(): HTMLElement;
export declare function getWorkbenchConstructionOptions(): IWorkbenchConstructionOptions;
export declare function getEnvironmentOverride(): EnvironmentOverride;
export declare function getWorkspaceIdentifier(): IAnyWorkspaceIdentifier;
export declare function initialize(container: HTMLElement, options: IWorkbenchConstructionOptions, env?: EnvironmentOverride): void;
