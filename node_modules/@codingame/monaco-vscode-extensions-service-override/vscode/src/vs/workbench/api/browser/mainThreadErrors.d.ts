import { SerializedError } from "@codingame/monaco-vscode-api/vscode/vs/base/common/errors";
import { MainThreadErrorsShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadErrors implements MainThreadErrorsShape {
    dispose(): void;
    $onUnexpectedError(err: unknown | SerializedError): void;
}
