
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Event } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { Disposable, toDisposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { TerminalCapability } from '@codingame/monaco-vscode-api/vscode/vs/platform/terminal/common/capabilities/capabilities';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { ITerminalService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/terminal/browser/terminal.service';
import { IWorkbenchEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { TerminalShellExecutionCommandLineConfidence } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHostTypes';
import { IExtensionService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service';

let MainThreadTerminalShellIntegration = class MainThreadTerminalShellIntegration extends Disposable {
    constructor(
        extHostContext,
        _terminalService,
        workbenchEnvironmentService,
        _extensionService
    ) {
        super();
        this._terminalService = _terminalService;
        this._extensionService = _extensionService;
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostTerminalShellIntegration));
        const instanceDataListeners = ( new Map());
        this._register(toDisposable(() => {
            for (const listener of ( instanceDataListeners.values())) {
                listener.dispose();
            }
        }));
        for (const terminal of this._terminalService.instances) {
            const cmdDetection = terminal.capabilities.get(TerminalCapability.CommandDetection);
            if (cmdDetection) {
                this._enableShellIntegration(terminal);
            }
        }
        const onDidAddCommandDetection = this._store.add(this._terminalService.createOnInstanceEvent(instance => {
            return ( Event.map(instance.capabilities.onDidAddCommandDetectionCapability, () => instance));
        })).event;
        this._store.add(onDidAddCommandDetection(e => this._enableShellIntegration(e)));
        const cwdChangeEvent = this._store.add(
            this._terminalService.createOnInstanceCapabilityEvent(TerminalCapability.CwdDetection, e => e.onDidChangeCwd)
        );
        this._store.add(cwdChangeEvent.event(e => {
            this._proxy.$cwdChange(e.instance.instanceId, e.data);
        }));
        const envChangeEvent = this._store.add(
            this._terminalService.createOnInstanceCapabilityEvent(TerminalCapability.ShellEnvDetection, e => e.onDidChangeEnv)
        );
        this._store.add(envChangeEvent.event(e => {
            if (e.data.value && typeof e.data.value === "object") {
                const envValue = e.data.value;
                const keysArr = ( Object.keys(envValue));
                const valuesArr = ( Object.values(envValue));
                this._proxy.$shellEnvChange(e.instance.instanceId, keysArr, valuesArr, e.data.isTrusted);
            }
        }));
        const commandDetectionStartEvent = this._store.add(
            this._terminalService.createOnInstanceCapabilityEvent(TerminalCapability.CommandDetection, e => e.onCommandExecuted)
        );
        let currentCommand;
        this._store.add(commandDetectionStartEvent.event(e => {
            if (e.data === currentCommand) {
                return;
            }
            currentCommand = e.data;
            const instanceId = e.instance.instanceId;
            this._proxy.$shellExecutionStart(
                instanceId,
                instanceSupportsExecuteCommandApi(e.instance),
                e.data.command,
                convertToExtHostCommandLineConfidence(e.data),
                e.data.isTrusted,
                e.data.cwd
            );
            instanceDataListeners.get(instanceId)?.dispose();
            instanceDataListeners.set(
                instanceId,
                Event.accumulate(e.instance.onData, 50, true, this._store)(events => {
                    this._proxy.$shellExecutionData(instanceId, events.join(""));
                })
            );
        }));
        const commandDetectionEndEvent = this._store.add(
            this._terminalService.createOnInstanceCapabilityEvent(TerminalCapability.CommandDetection, e => e.onCommandFinished)
        );
        this._store.add(commandDetectionEndEvent.event(e => {
            currentCommand = undefined;
            const instanceId = e.instance.instanceId;
            instanceDataListeners.get(instanceId)?.dispose();
            this._proxy.$shellExecutionEnd(
                instanceId,
                e.data.command,
                convertToExtHostCommandLineConfidence(e.data),
                e.data.isTrusted,
                e.data.exitCode
            );
        }));
        this._store.add(
            this._terminalService.onDidDisposeInstance(e => this._proxy.$closeTerminal(e.instanceId))
        );
    }
    $executeCommand(terminalId, commandLine) {
        this._terminalService.getInstanceFromId(terminalId)?.runCommand(commandLine, true);
    }
    _enableShellIntegration(instance) {
        this._extensionService.activateByEvent("onTerminalShellIntegration:*");
        if (instance.shellType) {
            this._extensionService.activateByEvent(`onTerminalShellIntegration:${instance.shellType}`);
        }
        this._proxy.$shellIntegrationChange(instance.instanceId, instanceSupportsExecuteCommandApi(instance));
        const cwdDetection = instance.capabilities.get(TerminalCapability.CwdDetection);
        if (cwdDetection) {
            this._proxy.$cwdChange(instance.instanceId, cwdDetection.getCwd());
        }
    }
};
MainThreadTerminalShellIntegration = __decorate([
    extHostNamedCustomer(MainContext.MainThreadTerminalShellIntegration),
    ( __param(1, ITerminalService)),
    ( __param(2, IWorkbenchEnvironmentService)),
    ( __param(3, IExtensionService))
], MainThreadTerminalShellIntegration);
function convertToExtHostCommandLineConfidence(command) {
    switch (command.commandLineConfidence) {
    case "high":
        return TerminalShellExecutionCommandLineConfidence.High;
    case "medium":
        return TerminalShellExecutionCommandLineConfidence.Medium;
    case "low":
    default:
        return TerminalShellExecutionCommandLineConfidence.Low;
    }
}
function instanceSupportsExecuteCommandApi(instance) {
    return instance.shellLaunchConfig.type !== "Task";
}

export { MainThreadTerminalShellIntegration };
