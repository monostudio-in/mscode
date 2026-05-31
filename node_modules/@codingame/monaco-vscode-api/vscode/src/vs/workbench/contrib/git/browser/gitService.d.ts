import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IGitExtensionDelegate, GitRef, GitRefQuery, IGitRepository, GitRepositoryState, GitDiffChange } from "@codingame/monaco-vscode-extensions-service-override/vscode/vs/workbench/contrib/git/common/gitService";
import { IGitService } from "../common/gitService.service.js";
import { ISettableObservable } from "../../../../base/common/observable.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
export declare class GitService extends Disposable implements IGitService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private _delegate;
    private _delegateBarrier;
    get repositories(): Iterable<IGitRepository>;
    constructor(logService: ILogService);
    setDelegate(delegate: IGitExtensionDelegate): IDisposable;
    openRepository(uri: URI): Promise<IGitRepository | undefined>;
}
export declare class GitRepository extends Disposable implements IGitRepository {
    private readonly delegate;
    readonly rootUri: URI;
    readonly state: ISettableObservable<GitRepositoryState>;
    updateState(state: GitRepositoryState): void;
    constructor(rootUri: URI, initialState: GitRepositoryState, delegate: IGitExtensionDelegate);
    getRefs(query: GitRefQuery, token?: CancellationToken): Promise<GitRef[]>;
    diffBetweenWithStats(ref1: string, ref2: string, path?: string): Promise<GitDiffChange[]>;
    diffBetweenWithStats2(ref: string, path?: string): Promise<GitDiffChange[]>;
}
