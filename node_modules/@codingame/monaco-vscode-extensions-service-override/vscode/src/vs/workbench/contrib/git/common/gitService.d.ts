import { CancellationToken } from "@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation";
import { IObservable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/observable";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
export declare enum GitRefType {
    Head = 0,
    RemoteHead = 1,
    Tag = 2
}
export interface GitRef {
    readonly type: GitRefType;
    readonly name?: string;
    readonly commit?: string;
    readonly remote?: string;
}
export interface GitRefQuery {
    readonly contains?: string;
    readonly count?: number;
    readonly pattern?: string | string[];
    readonly sort?: "alphabetically" | "committerdate" | "creatordate";
}
export interface GitChange {
    readonly uri: URI;
    readonly originalUri: URI | undefined;
    readonly modifiedUri: URI | undefined;
}
export interface GitDiffChange extends GitChange {
    readonly insertions: number;
    readonly deletions: number;
}
export interface GitRemote {
    readonly name: string;
    readonly fetchUrl?: string;
    readonly pushUrl?: string;
    readonly isReadOnly: boolean;
}
export interface GitRepositoryState {
    readonly HEAD?: GitBranch;
    readonly remotes: readonly GitRemote[];
    readonly mergeChanges: readonly GitChange[];
    readonly indexChanges: readonly GitChange[];
    readonly workingTreeChanges: readonly GitChange[];
    readonly untrackedChanges: readonly GitChange[];
}
export interface GitBranch extends GitRef {
    readonly upstream?: GitUpstreamRef;
    readonly ahead?: number;
    readonly behind?: number;
}
export interface GitBaseRef {
    readonly name: string;
    readonly isProtected: boolean;
}
export interface GitUpstreamRef {
    readonly remote: string;
    readonly name: string;
    readonly commit?: string;
}
export interface IGitRepository {
    readonly rootUri: URI;
    readonly state: IObservable<GitRepositoryState>;
    updateState(state: GitRepositoryState): void;
    getRefs(query: GitRefQuery, token?: CancellationToken): Promise<GitRef[]>;
    diffBetweenWithStats(ref1: string, ref2: string, path?: string): Promise<GitDiffChange[]>;
    diffBetweenWithStats2(ref: string, path?: string): Promise<GitDiffChange[]>;
}
export interface IGitExtensionDelegate {
    readonly repositories: Iterable<IGitRepository>;
    openRepository(uri: URI): Promise<IGitRepository | undefined>;
    getRefs(root: URI, query?: GitRefQuery, token?: CancellationToken): Promise<GitRef[]>;
    diffBetweenWithStats(root: URI, ref1: string, ref2: string, path?: string): Promise<GitDiffChange[]>;
    diffBetweenWithStats2(root: URI, ref: string, path?: string): Promise<GitDiffChange[]>;
}
