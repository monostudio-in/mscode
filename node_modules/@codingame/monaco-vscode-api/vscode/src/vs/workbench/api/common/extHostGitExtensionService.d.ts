import type * as vscode from "vscode";
import { Disposable } from "../../../base/common/lifecycle.js";
import { UriComponents } from "../../../base/common/uri.js";
import { IExtHostExtensionService } from "./extHostExtensionService.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { ExtHostGitExtensionShape, GitDiffChangeDto, GitRefDto, GitRefQueryDto, GitRepositoryStateDto } from "./extHost.protocol.js";
export interface IExtHostGitExtensionService extends ExtHostGitExtensionShape {
    readonly _serviceBrand: undefined;
}
export declare const IExtHostGitExtensionService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostGitExtensionService>;
export declare class ExtHostGitExtensionService extends Disposable implements IExtHostGitExtensionService {
    private readonly _extHostExtensionService;
    readonly _serviceBrand: undefined;
    private static _handlePool;
    private _gitApi;
    private readonly _proxy;
    private readonly _repositories;
    private readonly _repositoryByUri;
    private readonly _repositoryStateChangeListeners;
    constructor(extHostRpc: IExtHostRpcService, _extHostExtensionService: IExtHostExtensionService);
    $isGitExtensionAvailable(): Promise<boolean>;
    $openRepository(uri: UriComponents): Promise<{
        handle: number;
        rootUri: UriComponents;
        state: GitRepositoryStateDto;
    } | undefined>;
    $getRefs(handle: number, query: GitRefQueryDto, token?: vscode.CancellationToken): Promise<GitRefDto[]>;
    $getRepositoryState(handle: number): Promise<GitRepositoryStateDto | undefined>;
    private _getRepositoryState;
    private _setRepositoryStateChangeListener;
    $diffBetweenWithStats(handle: number, ref1: string, ref2: string, path?: string): Promise<GitDiffChangeDto[]>;
    $diffBetweenWithStats2(handle: number, ref: string, path?: string): Promise<GitDiffChangeDto[]>;
    private _ensureGitApi;
    dispose(): void;
}
