import { Disposable } from "../../../../base/common/lifecycle.js";
import { IShellEnvDetectionCapability, TerminalCapability, TerminalShellIntegrationEnvironment } from "./capabilities.js";
export interface IShellEnv {
    value: Map<string, string>;
    isTrusted: boolean;
}
export declare class ShellEnvDetectionCapability extends Disposable implements IShellEnvDetectionCapability {
    readonly type = TerminalCapability.ShellEnvDetection;
    private _pendingEnv;
    private _env;
    get env(): TerminalShellIntegrationEnvironment;
    private readonly _onDidChangeEnv;
    readonly onDidChangeEnv: import("../../../../base/common/event.js").Event<TerminalShellIntegrationEnvironment>;
    setEnvironment(env: {
        [key: string]: string | undefined;
    }, isTrusted: boolean): void;
    startEnvironmentSingleVar(clear: boolean, isTrusted: boolean): void;
    setEnvironmentSingleVar(key: string, value: string | undefined, isTrusted: boolean): void;
    endEnvironmentSingleVar(isTrusted: boolean): void;
    deleteEnvironmentSingleVar(key: string, value: string | undefined, isTrusted: boolean): void;
    private _fireEnvChange;
    private _createStateObject;
}
