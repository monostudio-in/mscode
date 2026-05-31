import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IGitRepository, IGitExtensionDelegate } from "@codingame/monaco-vscode-extensions-service-override/vscode/vs/workbench/contrib/git/common/gitService";
export declare const IGitService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IGitService>;
export interface IGitService {
    readonly _serviceBrand: undefined;
    readonly repositories: Iterable<IGitRepository>;
    setDelegate(delegate: IGitExtensionDelegate): IDisposable;
    openRepository(uri: URI): Promise<IGitRepository | undefined>;
}
