import { IExtensionDescription } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
export declare function dedupExtensions(system: IExtensionDescription[], user: IExtensionDescription[], workspace: IExtensionDescription[], development: IExtensionDescription[], logService: ILogService): IExtensionDescription[];
