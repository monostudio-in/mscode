import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ILanguageModelIgnoredFileProvider } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/common/ignoredFiles";
export declare const ILanguageModelIgnoredFilesService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageModelIgnoredFilesService>;
export interface ILanguageModelIgnoredFilesService {
    _serviceBrand: undefined;
    fileIsIgnored(uri: URI, token: CancellationToken): Promise<boolean>;
    registerIgnoredFileProvider(provider: ILanguageModelIgnoredFileProvider): IDisposable;
}
