import { IAction } from "../../../../base/common/actions.js";
import { AsyncIterableProducer } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { INotebookKernelSourceAction } from "./notebookCommon.js";
export interface ISelectedNotebooksChangeEvent {
    notebook: URI;
    oldKernel: string | undefined;
    newKernel: string | undefined;
}
export interface INotebookKernelMatchResult {
    readonly selected: INotebookKernel | undefined;
    readonly suggestions: INotebookKernel[];
    readonly all: INotebookKernel[];
    readonly hidden: INotebookKernel[];
}
export interface INotebookKernelChangeEvent {
    label?: true;
    description?: true;
    detail?: true;
    supportedLanguages?: true;
    hasExecutionOrder?: true;
    hasInterruptHandler?: true;
    hasVariableProvider?: true;
}
export interface VariablesResult {
    id: number;
    name: string;
    value: string;
    type?: string;
    hasNamedChildren: boolean;
    indexedChildrenCount: number;
}
export declare const variablePageSize = 100;
export interface INotebookKernel {
    readonly id: string;
    readonly viewType: string;
    readonly onDidChange: Event<Readonly<INotebookKernelChangeEvent>>;
    readonly extension: ExtensionIdentifier;
    readonly localResourceRoot: URI;
    readonly preloadUris: URI[];
    readonly preloadProvides: string[];
    label: string;
    description?: string;
    detail?: string;
    supportedLanguages: string[];
    implementsInterrupt?: boolean;
    implementsExecutionOrder?: boolean;
    hasVariableProvider?: boolean;
    executeNotebookCellsRequest(uri: URI, cellHandles: number[]): Promise<void>;
    cancelNotebookCellExecution(uri: URI, cellHandles: number[]): Promise<void>;
    provideVariables(notebookUri: URI, parentId: number | undefined, kind: "named" | "indexed", start: number, token: CancellationToken): AsyncIterableProducer<VariablesResult>;
}
export declare enum ProxyKernelState {
    Disconnected = 1,
    Connected = 2,
    Initializing = 3
}
export interface INotebookProxyKernelChangeEvent extends INotebookKernelChangeEvent {
    connectionState?: true;
}
export interface INotebookKernelDetectionTask {
    readonly notebookType: string;
}
export interface ISourceAction {
    readonly action: IAction;
    readonly onDidChangeState: Event<void>;
    readonly isPrimary?: boolean;
    execution: Promise<void> | undefined;
    runAction: () => Promise<void>;
}
export interface INotebookSourceActionChangeEvent {
    notebook?: URI;
    viewType: string;
}
export interface IKernelSourceActionProvider {
    readonly viewType: string;
    onDidChangeSourceActions?: Event<void>;
    provideKernelSourceActions(): Promise<INotebookKernelSourceAction[]>;
}
export interface INotebookTextModelLike {
    uri: URI;
    notebookType: string;
}
