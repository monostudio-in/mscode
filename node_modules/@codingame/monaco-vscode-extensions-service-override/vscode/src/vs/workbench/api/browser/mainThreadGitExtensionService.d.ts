import { CancellationToken } from "@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { IGitExtensionDelegate, GitRef, GitRefQuery, GitDiffChange, IGitRepository } from "../../contrib/git/common/gitService.js";
import { IGitService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/git/common/gitService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadGitExtensionShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadGitExtensionService extends Disposable implements MainThreadGitExtensionShape, IGitExtensionDelegate {
    private readonly gitService;
    private readonly _proxy;
    private readonly _openRepositorySequencer;
    private _repositoryHandles;
    private _repositories;
    get repositories(): Iterable<IGitRepository>;
    constructor(extHostContext: IExtHostContext, gitService: IGitService);
    private _initializeDelegate;
    openRepository(uri: URI): Promise<IGitRepository | undefined>;
    getRefs(root: URI, query: GitRefQuery, token?: CancellationToken): Promise<GitRef[]>;
    diffBetweenWithStats(root: URI, ref1: string, ref2: string, path?: string): Promise<GitDiffChange[]>;
    diffBetweenWithStats2(root: URI, ref: string, path?: string): Promise<GitDiffChange[]>;
    $onDidChangeRepository(handle: number): Promise<void>;
}
