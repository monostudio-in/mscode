import { MainThreadLocalizationShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { URI, UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { IFileService } from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { ILanguagePackService } from "@codingame/monaco-vscode-api/vscode/vs/platform/languagePacks/common/languagePacks.service";
export declare class MainThreadLocalization extends Disposable implements MainThreadLocalizationShape {
    private readonly fileService;
    private readonly languagePackService;
    constructor(extHostContext: IExtHostContext, fileService: IFileService, languagePackService: ILanguagePackService);
    $fetchBuiltInBundleUri(id: string, language: string): Promise<URI | undefined>;
    $fetchBundleContents(uriComponents: UriComponents): Promise<string>;
}
