
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Sequencer } from '@codingame/monaco-vscode-api/vscode/vs/base/common/async';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { ResourceMap } from '@codingame/monaco-vscode-api/vscode/vs/base/common/map';
import '@codingame/monaco-vscode-api/vscode/vs/base/common/observableInternal/index';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { GitRepository } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/git/browser/gitService';
import { GitRefType } from '../../contrib/git/common/gitService.js';
import { IGitService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/git/common/gitService.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { GitRefTypeDto, ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { waitForState } from '@codingame/monaco-vscode-api/vscode/vs/base/common/observableInternal/utils/utilsCancellation';

function toGitRefType(type) {
    switch (type) {
    case GitRefTypeDto.Head:
        return GitRefType.Head;
    case GitRefTypeDto.RemoteHead:
        return GitRefType.RemoteHead;
    case GitRefTypeDto.Tag:
        return GitRefType.Tag;
    default:
        throw ( new Error(`Unknown GitRefType: ${type}`));
    }
}
function toGitDiffChange(dto) {
    return {
        uri: URI.revive(dto.uri),
        originalUri: dto.originalUri ? URI.revive(dto.originalUri) : undefined,
        modifiedUri: dto.modifiedUri ? URI.revive(dto.modifiedUri) : undefined,
        insertions: dto.insertions,
        deletions: dto.deletions
    };
}
function toGitRepositoryState(dto) {
    return {
        HEAD: dto?.HEAD ? {
            type: toGitRefType(dto.HEAD.type),
            name: dto.HEAD.name,
            commit: dto.HEAD.commit,
            remote: dto.HEAD.remote,
            upstream: dto.HEAD.upstream,
            ahead: dto.HEAD.ahead,
            behind: dto.HEAD.behind
        } : undefined,
        remotes: dto?.remotes ?? [],
        mergeChanges: dto?.mergeChanges?.map(c => ({
            uri: URI.revive(c.uri),
            originalUri: c.originalUri ? URI.revive(c.originalUri) : undefined,
            modifiedUri: c.modifiedUri ? URI.revive(c.modifiedUri) : undefined
        })) ?? [],
        indexChanges: dto?.indexChanges?.map(c => ({
            uri: URI.revive(c.uri),
            originalUri: c.originalUri ? URI.revive(c.originalUri) : undefined,
            modifiedUri: c.modifiedUri ? URI.revive(c.modifiedUri) : undefined
        })) ?? [],
        workingTreeChanges: dto?.workingTreeChanges?.map(c => ({
            uri: URI.revive(c.uri),
            originalUri: c.originalUri ? URI.revive(c.originalUri) : undefined,
            modifiedUri: c.modifiedUri ? URI.revive(c.modifiedUri) : undefined
        })) ?? [],
        untrackedChanges: dto?.untrackedChanges?.map(c => ({
            uri: URI.revive(c.uri),
            originalUri: c.originalUri ? URI.revive(c.originalUri) : undefined,
            modifiedUri: c.modifiedUri ? URI.revive(c.modifiedUri) : undefined
        })) ?? []
    };
}
let MainThreadGitExtensionService = class MainThreadGitExtensionService extends Disposable {
    get repositories() {
        return ( this._repositories.values());
    }
    constructor(extHostContext, gitService) {
        super();
        this.gitService = gitService;
        this._openRepositorySequencer = ( new Sequencer());
        this._repositoryHandles = ( new ResourceMap());
        this._repositories = ( new Map());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostGitExtension));
        this._initializeDelegate();
    }
    async _initializeDelegate() {
        const isExtensionAvailable = await this._proxy.$isGitExtensionAvailable();
        if (isExtensionAvailable && !this._store.isDisposed) {
            this._register(this.gitService.setDelegate(this));
        }
    }
    async openRepository(uri) {
        return this._openRepositorySequencer.queue(async () => {
            const result = await this._proxy.$openRepository(uri);
            if (!result) {
                return undefined;
            }
            const repositoryRootUri = URI.revive(result.rootUri);
            const state = toGitRepositoryState(result.state);
            const repository = ( new GitRepository(repositoryRootUri, state, this));
            this._repositories.set(result.handle, repository);
            this._repositoryHandles.set(repositoryRootUri, result.handle);
            await waitForState(repository.state, state => state.HEAD !== undefined);
            return repository;
        });
    }
    async getRefs(root, query, token) {
        const handle = this._repositoryHandles.get(root);
        if (handle === undefined) {
            return [];
        }
        const result = await this._proxy.$getRefs(handle, query, token);
        if (token?.isCancellationRequested) {
            return [];
        }
        return ( result.map(ref => ({
            ...ref,
            type: toGitRefType(ref.type)
        })));
    }
    async diffBetweenWithStats(root, ref1, ref2, path) {
        const handle = this._repositoryHandles.get(root);
        if (handle === undefined) {
            return [];
        }
        const result = await this._proxy.$diffBetweenWithStats(handle, ref1, ref2, path);
        return ( result.map(toGitDiffChange));
    }
    async diffBetweenWithStats2(root, ref, path) {
        const handle = this._repositoryHandles.get(root);
        if (handle === undefined) {
            return [];
        }
        const result = await this._proxy.$diffBetweenWithStats2(handle, ref, path);
        return ( result.map(toGitDiffChange));
    }
    async $onDidChangeRepository(handle) {
        const repository = this._repositories.get(handle);
        if (!repository) {
            return;
        }
        const state = await this._proxy.$getRepositoryState(handle);
        if (!state) {
            return;
        }
        repository.updateState(toGitRepositoryState(state));
    }
};
MainThreadGitExtensionService = __decorate([extHostNamedCustomer(MainContext.MainThreadGitExtension), ( __param(1, IGitService))], MainThreadGitExtensionService);

export { MainThreadGitExtensionService };
