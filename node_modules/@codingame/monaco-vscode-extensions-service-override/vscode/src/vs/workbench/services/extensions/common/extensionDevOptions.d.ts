import { IEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service";
export interface IExtensionDevOptions {
    readonly isExtensionDevHost: boolean;
    readonly isExtensionDevDebug: boolean;
    readonly isExtensionDevDebugBrk: boolean;
    readonly isExtensionDevTestFromCli: boolean;
}
export declare function parseExtensionDevOptions(environmentService: IEnvironmentService): IExtensionDevOptions;
