import { Disposable } from "../../../../base/common/lifecycle.js";
import { OperatingSystem } from "../../../../base/common/platform.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ITerminalCapabilityStore } from "../../../../platform/terminal/common/capabilities/capabilities.js";
import { IMergedEnvironmentVariableCollection } from "@codingame/monaco-vscode-xterm-common/vscode/vs/platform/terminal/common/environmentVariable";
import { ITerminalBackend } from "../../../../platform/terminal/common/terminal.js";
import { IDetachedTerminalInstance, IDetachedXTermOptions, IDetachedXtermTerminal, ITerminalContribution, IXtermAttachToElementOptions } from "./terminal.js";
import { XtermTerminal } from "@codingame/monaco-vscode-xterm-addons-common/vscode/vs/workbench/contrib/terminal/browser/xterm/xtermTerminal";
import { IEnvironmentVariableInfo } from "../common/environmentVariable.js";
import { ITerminalProcessInfo, ProcessState } from "../common/terminal.js";
import { Event } from "../../../../base/common/event.js";
export declare class DetachedTerminal extends Disposable implements IDetachedTerminalInstance {
    private readonly _xterm;
    private readonly _widgets;
    readonly capabilities: ITerminalCapabilityStore;
    private readonly _contributions;
    private readonly _attachDisposables;
    domElement?: HTMLElement;
    get xterm(): IDetachedXtermTerminal;
    readonly onData: Event<string>;
    constructor(_xterm: XtermTerminal, options: IDetachedXTermOptions, instantiationService: IInstantiationService);
    get selection(): string | undefined;
    hasSelection(): boolean;
    clearSelection(): void;
    focus(force?: boolean): void;
    attachToElement(container: HTMLElement, options?: Partial<IXtermAttachToElementOptions> | undefined): void;
    forceScrollbarVisibility(): void;
    resetScrollbarVisibility(): void;
    getContribution<T extends ITerminalContribution>(id: string): T | null;
}
/**
 * Implements {@link ITerminalProcessInfo} for a detached terminal where most
 * properties are stubbed. Properties are mutable and can be updated by
 * the instantiator.
 */
export declare class DetachedProcessInfo extends Disposable implements ITerminalProcessInfo {
    processState: ProcessState;
    ptyProcessReady: Promise<void>;
    shellProcessId: number | undefined;
    remoteAuthority: string | undefined;
    os: OperatingSystem | undefined;
    userHome: string | undefined;
    initialCwd: string;
    environmentVariableInfo: IEnvironmentVariableInfo | undefined;
    persistentProcessId: number | undefined;
    shouldPersist: boolean;
    hasWrittenData: boolean;
    hasChildProcesses: boolean;
    backend: ITerminalBackend | undefined;
    capabilities: ITerminalCapabilityStore;
    shellIntegrationNonce: string;
    extEnvironmentVariableCollection: IMergedEnvironmentVariableCollection | undefined;
    constructor(initialValues: Partial<ITerminalProcessInfo>);
}
