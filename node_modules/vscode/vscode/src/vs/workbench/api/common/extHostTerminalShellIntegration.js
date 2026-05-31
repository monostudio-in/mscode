
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { TerminalShellExecutionCommandLineConfidence } from './extHostTypes.js';
import { Disposable, toDisposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { MainContext } from './extHost.protocol.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { IExtHostTerminalService } from './extHostTerminalService.js';
import { Emitter } from '../../../base/common/event.js';
import { URI } from '../../../base/common/uri.js';
import { AsyncIterableObject, Barrier } from '../../../base/common/async.js';

const IExtHostTerminalShellIntegration = ( createDecorator("IExtHostTerminalShellIntegration"));
let ExtHostTerminalShellIntegration = class ExtHostTerminalShellIntegration extends Disposable {
    constructor(extHostRpc, _extHostTerminalService) {
        super();
        this._extHostTerminalService = _extHostTerminalService;
        this._activeShellIntegrations = ( new Map());
        this._onDidChangeTerminalShellIntegration = this._register(( new Emitter()));
        this.onDidChangeTerminalShellIntegration = this._onDidChangeTerminalShellIntegration.event;
        this._onDidStartTerminalShellExecution = this._register(( new Emitter()));
        this.onDidStartTerminalShellExecution = this._onDidStartTerminalShellExecution.event;
        this._onDidEndTerminalShellExecution = this._register(( new Emitter()));
        this.onDidEndTerminalShellExecution = this._onDidEndTerminalShellExecution.event;
        this._proxy = ( extHostRpc.getProxy(MainContext.MainThreadTerminalShellIntegration));
        this._register(toDisposable(() => {
            for (const [_, integration] of this._activeShellIntegrations) {
                integration.dispose();
            }
            this._activeShellIntegrations.clear();
        }));
    }
    $shellIntegrationChange(instanceId, supportsExecuteCommandApi) {
        const terminal = this._extHostTerminalService.getTerminalById(instanceId);
        if (!terminal) {
            return;
        }
        const apiTerminal = terminal.value;
        let shellIntegration = this._activeShellIntegrations.get(instanceId);
        if (!shellIntegration) {
            shellIntegration = ( new InternalTerminalShellIntegration(
                terminal.value,
                supportsExecuteCommandApi,
                this._onDidStartTerminalShellExecution
            ));
            this._activeShellIntegrations.set(instanceId, shellIntegration);
            shellIntegration.store.add(
                terminal.onWillDispose(() => this._activeShellIntegrations.get(instanceId)?.dispose())
            );
            shellIntegration.store.add(
                shellIntegration.onDidRequestShellExecution(commandLine => this._proxy.$executeCommand(instanceId, commandLine))
            );
            shellIntegration.store.add(
                shellIntegration.onDidRequestEndExecution(e => this._onDidEndTerminalShellExecution.fire(e))
            );
            shellIntegration.store.add(
                shellIntegration.onDidRequestChangeShellIntegration(e => this._onDidChangeTerminalShellIntegration.fire(e))
            );
            terminal.shellIntegration = shellIntegration.value;
        }
        this._onDidChangeTerminalShellIntegration.fire({
            terminal: apiTerminal,
            shellIntegration: shellIntegration.value
        });
    }
    $shellExecutionStart(
        instanceId,
        supportsExecuteCommandApi,
        commandLineValue,
        commandLineConfidence,
        isTrusted,
        cwd
    ) {
        if (!( this._activeShellIntegrations.has(instanceId))) {
            this.$shellIntegrationChange(instanceId, supportsExecuteCommandApi);
        }
        const commandLine = {
            value: commandLineValue,
            confidence: commandLineConfidence,
            isTrusted
        };
        this._activeShellIntegrations.get(instanceId)?.startShellExecution(commandLine, this._convertCwdToUri(cwd));
    }
    $shellExecutionEnd(instanceId, commandLineValue, commandLineConfidence, isTrusted, exitCode) {
        const commandLine = {
            value: commandLineValue,
            confidence: commandLineConfidence,
            isTrusted
        };
        this._activeShellIntegrations.get(instanceId)?.endShellExecution(commandLine, exitCode);
    }
    $shellExecutionData(instanceId, data) {
        this._activeShellIntegrations.get(instanceId)?.emitData(data);
    }
    $shellEnvChange(instanceId, shellEnvKeys, shellEnvValues, isTrusted) {
        this._activeShellIntegrations.get(instanceId)?.setEnv(shellEnvKeys, shellEnvValues, isTrusted);
    }
    $cwdChange(instanceId, cwd) {
        this._activeShellIntegrations.get(instanceId)?.setCwd(this._convertCwdToUri(cwd));
    }
    $closeTerminal(instanceId) {
        this._activeShellIntegrations.get(instanceId)?.dispose();
        this._activeShellIntegrations.delete(instanceId);
    }
    _convertCwdToUri(cwd) {
        return cwd ? URI.file(cwd) : undefined;
    }
};
ExtHostTerminalShellIntegration = ( __decorate([( __param(0, IExtHostRpcService)), ( __param(1, IExtHostTerminalService))], ExtHostTerminalShellIntegration));
class InternalTerminalShellIntegration extends Disposable {
    get currentExecution() {
        return this._currentExecution;
    }
    constructor(_terminal, supportsExecuteCommandApi, _onDidStartTerminalShellExecution) {
        super();
        this._terminal = _terminal;
        this._onDidStartTerminalShellExecution = _onDidStartTerminalShellExecution;
        this._pendingExecutions = [];
        this.store = this._register(( new DisposableStore()));
        this._onDidRequestChangeShellIntegration = this._register(( new Emitter()));
        this.onDidRequestChangeShellIntegration = this._onDidRequestChangeShellIntegration.event;
        this._onDidRequestShellExecution = this._register(( new Emitter()));
        this.onDidRequestShellExecution = this._onDidRequestShellExecution.event;
        this._onDidRequestEndExecution = this._register(( new Emitter()));
        this.onDidRequestEndExecution = this._onDidRequestEndExecution.event;
        this._onDidRequestNewExecution = this._register(( new Emitter()));
        this.onDidRequestNewExecution = this._onDidRequestNewExecution.event;
        const that = this;
        this.value = {
            get cwd() {
                return that._cwd;
            },
            get env() {
                if (!that._env) {
                    return undefined;
                }
                return ( Object.freeze({
                    isTrusted: that._env.isTrusted,
                    value: ( Object.freeze({
                        ...that._env.value
                    }))
                }));
            },
            executeCommand(commandLineOrExecutable, args) {
                if (!supportsExecuteCommandApi) {
                    throw ( new Error("This terminal does not support the executeCommand API."));
                }
                let commandLineValue = commandLineOrExecutable;
                if (args) {
                    for (const arg of args) {
                        const wrapInQuotes = !arg.match(/["'`]/) && arg.match(/\s/);
                        if (wrapInQuotes) {
                            commandLineValue += ` "${arg}"`;
                        } else {
                            commandLineValue += ` ${arg}`;
                        }
                    }
                }
                that._onDidRequestShellExecution.fire(commandLineValue);
                const commandLine = {
                    value: commandLineValue,
                    confidence: TerminalShellExecutionCommandLineConfidence.High,
                    isTrusted: true
                };
                const execution = that.requestNewShellExecution(commandLine, that._cwd).value;
                return execution;
            }
        };
    }
    requestNewShellExecution(commandLine, cwd) {
        const execution = ( new InternalTerminalShellExecution(commandLine, cwd ?? this._cwd));
        const unresolvedCommandLines = splitAndSanitizeCommandLine(commandLine.value);
        if (unresolvedCommandLines.length > 1) {
            this._currentExecutionProperties = {
                isMultiLine: true,
                unresolvedCommandLines: splitAndSanitizeCommandLine(commandLine.value)
            };
        }
        this._pendingExecutions.push(execution);
        this._onDidRequestNewExecution.fire(commandLine.value);
        return execution;
    }
    startShellExecution(commandLine, cwd) {
        if (this._pendingEndingExecution) {
            this._onDidRequestEndExecution.fire({
                terminal: this._terminal,
                shellIntegration: this.value,
                execution: this._pendingEndingExecution.value,
                exitCode: undefined
            });
            this._pendingEndingExecution = undefined;
        }
        if (this._currentExecution) {
            if (this._currentExecutionProperties?.isMultiLine && this._currentExecutionProperties.unresolvedCommandLines) {
                const subExecutionResult = isSubExecution(this._currentExecutionProperties.unresolvedCommandLines, commandLine);
                if (subExecutionResult) {
                    this._currentExecutionProperties.unresolvedCommandLines = subExecutionResult.unresolvedCommandLines;
                    return;
                }
            }
            this._currentExecution.endExecution(undefined);
            this._currentExecution.flush();
            this._onDidRequestEndExecution.fire({
                terminal: this._terminal,
                shellIntegration: this.value,
                execution: this._currentExecution.value,
                exitCode: undefined
            });
        }
        let currentExecution;
        if (commandLine.confidence === TerminalShellExecutionCommandLineConfidence.High) {
            for (const [i, execution] of this._pendingExecutions.entries()) {
                if (execution.value.commandLine.value === commandLine.value) {
                    currentExecution = execution;
                    this._currentExecutionProperties = {
                        isMultiLine: false,
                        unresolvedCommandLines: undefined
                    };
                    currentExecution = execution;
                    this._pendingExecutions.splice(i, 1);
                    break;
                } else {
                    const subExecutionResult = isSubExecution(
                        splitAndSanitizeCommandLine(execution.value.commandLine.value),
                        commandLine
                    );
                    if (subExecutionResult) {
                        this._currentExecutionProperties = {
                            isMultiLine: true,
                            unresolvedCommandLines: subExecutionResult.unresolvedCommandLines
                        };
                        currentExecution = execution;
                        this._pendingExecutions.splice(i, 1);
                        break;
                    }
                }
            }
        } else {
            currentExecution = this._pendingExecutions.shift();
        }
        if (!currentExecution) {
            currentExecution = ( new InternalTerminalShellExecution(commandLine, cwd ?? this._cwd));
        }
        this._currentExecution = currentExecution;
        this._onDidStartTerminalShellExecution.fire({
            terminal: this._terminal,
            shellIntegration: this.value,
            execution: this._currentExecution.value
        });
    }
    emitData(data) {
        this.currentExecution?.emitData(data);
    }
    endShellExecution(commandLine, exitCode) {
        if (this._currentExecutionProperties?.isMultiLine) {
            if (this._currentExecutionProperties.unresolvedCommandLines && this._currentExecutionProperties.unresolvedCommandLines.length > 0) {
                return;
            }
        }
        if (this._currentExecution) {
            const commandLineForEvent = this._currentExecutionProperties?.isMultiLine ? this._currentExecution.value.commandLine : commandLine;
            this._currentExecution.endExecution(commandLineForEvent);
            const currentExecution = this._currentExecution;
            this._pendingEndingExecution = currentExecution;
            this._currentExecution = undefined;
            currentExecution.flush().then(() => {
                if (this._pendingEndingExecution === currentExecution) {
                    this._onDidRequestEndExecution.fire({
                        terminal: this._terminal,
                        shellIntegration: this.value,
                        execution: currentExecution.value,
                        exitCode
                    });
                    this._pendingEndingExecution = undefined;
                }
            });
        }
    }
    setEnv(keys, values, isTrusted) {
        const env = {};
        for (let i = 0; i < keys.length; i++) {
            env[keys[i]] = values[i];
        }
        this._env = {
            value: env,
            isTrusted
        };
        this._fireChangeEvent();
    }
    setCwd(cwd) {
        let wasChanged = false;
        if (URI.isUri(this._cwd)) {
            wasChanged = !URI.isUri(cwd) || ( this._cwd.toString()) !== ( cwd.toString());
        } else if (this._cwd !== cwd) {
            wasChanged = true;
        }
        if (wasChanged) {
            this._cwd = cwd;
            this._fireChangeEvent();
        }
    }
    _fireChangeEvent() {
        this._onDidRequestChangeShellIntegration.fire({
            terminal: this._terminal,
            shellIntegration: this.value
        });
    }
}
class InternalTerminalShellExecution {
    constructor(_commandLine, cwd) {
        this._commandLine = _commandLine;
        this.cwd = cwd;
        this._isEnded = false;
        const that = this;
        this.value = {
            get commandLine() {
                return that._commandLine;
            },
            get cwd() {
                return that.cwd;
            },
            read() {
                return that._createDataStream();
            }
        };
    }
    _createDataStream() {
        if (!this._dataStream) {
            if (this._isEnded) {
                return AsyncIterableObject.EMPTY;
            }
            this._dataStream = ( new ShellExecutionDataStream());
        }
        return this._dataStream.createIterable();
    }
    emitData(data) {
        if (!this._isEnded) {
            this._dataStream?.emitData(data);
        }
    }
    endExecution(commandLine) {
        if (commandLine) {
            this._commandLine = commandLine;
        }
        this._dataStream?.endExecution();
        this._isEnded = true;
    }
    async flush() {
        if (this._dataStream) {
            await this._dataStream.flush();
            this._dataStream.dispose();
            this._dataStream = undefined;
        }
    }
}
class ShellExecutionDataStream extends Disposable {
    constructor() {
        super(...arguments);
        this._iterables = [];
        this._emitters = [];
    }
    createIterable() {
        if (!this._barrier) {
            this._barrier = ( new Barrier());
        }
        const barrier = this._barrier;
        const iterable = new AsyncIterableObject(async emitter => {
            this._emitters.push(emitter);
            await barrier.wait();
        });
        this._iterables.push(iterable);
        return iterable;
    }
    emitData(data) {
        for (const emitter of this._emitters) {
            emitter.emitOne(data);
        }
    }
    endExecution() {
        this._barrier?.open();
    }
    async flush() {
        await Promise.all(( this._iterables.map(e => e.toPromise())));
    }
}
function splitAndSanitizeCommandLine(commandLine) {
    return ( commandLine.split("\n").map(line => line.trim())).filter(line => line.length > 0);
}
function isSubExecution(unresolvedCommandLines, commandLine) {
    if (unresolvedCommandLines.length === 0) {
        return false;
    }
    const newUnresolvedCommandLines = [...unresolvedCommandLines];
    const subExecutionLines = splitAndSanitizeCommandLine(commandLine.value);
    if (newUnresolvedCommandLines && newUnresolvedCommandLines.length > 0) {
        while (newUnresolvedCommandLines.length > 0) {
            if (newUnresolvedCommandLines[0] !== subExecutionLines[0]) {
                break;
            }
            newUnresolvedCommandLines.shift();
            subExecutionLines.shift();
        }
        if (subExecutionLines.length === 0) {
            return {
                unresolvedCommandLines: newUnresolvedCommandLines
            };
        }
    }
    return false;
}

export { ExtHostTerminalShellIntegration, IExtHostTerminalShellIntegration, InternalTerminalShellIntegration };
