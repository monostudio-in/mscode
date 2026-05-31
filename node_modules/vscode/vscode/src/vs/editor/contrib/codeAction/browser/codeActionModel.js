
import { TimeoutTimer, createCancelablePromise } from '../../../../base/common/async.js';
import { isCancellationError } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { isEqual } from '../../../../base/common/resources.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { Progress } from '../../../../platform/progress/common/progress.js';
import { EditorOption, ShowLightbulbIconMode } from '../../../common/config/editorOptions.js';
import { Position } from '../../../common/core/position.js';
import { Selection } from '../../../common/core/selection.js';
import { CodeActionTriggerType } from '../../../common/languages.js';
import { CodeActionTriggerSource, CodeActionKind } from '../common/types.js';
import { getCodeActions } from './codeAction.js';

const SUPPORTED_CODE_ACTIONS = ( new RawContextKey("supportedCodeAction", ""));
const APPLY_FIX_ALL_COMMAND_ID = "_typescript.applyFixAllCodeAction";
class CodeActionOracle extends Disposable {
    constructor(_editor, _markerService, _signalChange, _delay = 250) {
        super();
        this._editor = _editor;
        this._markerService = _markerService;
        this._signalChange = _signalChange;
        this._delay = _delay;
        this._autoTriggerTimer = this._register(new TimeoutTimer());
        this.ignoreLightbulbOff = false;
        this._register(this._markerService.onMarkerChanged(e => this._onMarkerChanges(e)));
        this._register(this._editor.onDidChangeCursorPosition(() => this._tryAutoTrigger()));
    }
    trigger(trigger) {
        const selection = this._getRangeOfSelectionUnlessWhitespaceEnclosed(trigger);
        this._signalChange(selection ? {
            trigger,
            selection
        } : undefined);
    }
    _onMarkerChanges(resources) {
        const model = this._editor.getModel();
        if (model && ( resources.some(resource => isEqual(resource, model.uri)))) {
            this._tryAutoTrigger();
        }
    }
    _tryAutoTrigger() {
        this._autoTriggerTimer.cancelAndSet(() => {
            this.trigger({
                type: CodeActionTriggerType.Auto,
                triggerAction: CodeActionTriggerSource.Default
            });
        }, this._delay);
    }
    _getRangeOfSelectionUnlessWhitespaceEnclosed(trigger) {
        if (!this._editor.hasModel()) {
            return undefined;
        }
        const selection = this._editor.getSelection();
        if (trigger.type === CodeActionTriggerType.Invoke) {
            return selection;
        }
        const enabled = this._editor.getOption(EditorOption.lightbulb).enabled;
        if (enabled === ShowLightbulbIconMode.Off && !this.ignoreLightbulbOff) {
            return undefined;
        } else if (enabled === ShowLightbulbIconMode.Off || enabled === ShowLightbulbIconMode.On) {
            return selection;
        } else if (enabled === ShowLightbulbIconMode.OnCode) {
            const isSelectionEmpty = selection.isEmpty();
            if (!isSelectionEmpty) {
                return selection;
            }
            const model = this._editor.getModel();
            const {
                lineNumber,
                column
            } = selection.getPosition();
            const line = model.getLineContent(lineNumber);
            if (line.length === 0) {
                return undefined;
            } else if (column === 1) {
                if (/\s/.test(line[0])) {
                    return undefined;
                }
            } else if (column === model.getLineMaxColumn(lineNumber)) {
                if (/\s/.test(line[line.length - 1])) {
                    return undefined;
                }
            } else {
                if (/\s/.test(line[column - 2]) && /\s/.test(line[column - 1])) {
                    return undefined;
                }
            }
        }
        return selection;
    }
}
var CodeActionsState;
(function(CodeActionsState) {
    let Type;
    (function(Type) {
        Type[Type["Empty"] = 0] = "Empty";
        Type[Type["Triggered"] = 1] = "Triggered";
    })(Type = CodeActionsState.Type || (CodeActionsState.Type = {}));
    CodeActionsState.Empty = {
        type: Type.Empty
    };
    class Triggered {
        constructor(trigger, position, _cancellablePromise) {
            this.trigger = trigger;
            this.position = position;
            this._cancellablePromise = _cancellablePromise;
            this.type = Type.Triggered;
            this.actions = _cancellablePromise.catch(e => {
                if (isCancellationError(e)) {
                    return emptyCodeActionSet;
                }
                throw e;
            });
        }
        cancel() {
            this._cancellablePromise.cancel();
        }
    }
    CodeActionsState.Triggered = Triggered;
})(CodeActionsState || (CodeActionsState = {}));
const emptyCodeActionSet = ( Object.freeze({
    allActions: [],
    validActions: [],
    dispose: () => {},
    documentation: [],
    hasAutoFix: false,
    hasAIFix: false,
    allAIFixes: false
}));
class CodeActionModel extends Disposable {
    set ignoreLightbulbOff(value) {
        if (this._ignoreLightbulbOff === value) {
            return;
        }
        this._ignoreLightbulbOff = value;
        const oracle = this._codeActionOracle.value;
        if (oracle) {
            oracle.ignoreLightbulbOff = value;
            if (value) {
                oracle.trigger({
                    type: CodeActionTriggerType.Auto,
                    triggerAction: CodeActionTriggerSource.Default
                });
            }
        }
    }
    constructor(
        _editor,
        _registry,
        _markerService,
        contextKeyService,
        _progressService,
        _configurationService
    ) {
        super();
        this._editor = _editor;
        this._registry = _registry;
        this._markerService = _markerService;
        this._progressService = _progressService;
        this._configurationService = _configurationService;
        this._codeActionOracle = this._register(( new MutableDisposable()));
        this._state = CodeActionsState.Empty;
        this._onDidChangeState = this._register(( new Emitter()));
        this.onDidChangeState = this._onDidChangeState.event;
        this.codeActionsDisposable = this._register(( new MutableDisposable()));
        this._disposed = false;
        this._ignoreLightbulbOff = false;
        this._supportedCodeActions = SUPPORTED_CODE_ACTIONS.bindTo(contextKeyService);
        this._register(this._editor.onDidChangeModel(() => this._update()));
        this._register(this._editor.onDidChangeModelLanguage(() => this._update()));
        this._register(this._registry.onDidChange(() => this._update()));
        this._register(this._editor.onDidChangeConfiguration(e => {
            if (e.hasChanged(EditorOption.lightbulb)) {
                this._update();
            }
        }));
        this._update();
    }
    dispose() {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        super.dispose();
        this.setState(CodeActionsState.Empty, true);
    }
    _settingEnabledNearbyQuickfixes() {
        const model = this._editor?.getModel();
        return this._configurationService ? this._configurationService.getValue("editor.codeActionWidget.includeNearbyQuickFixes", {
            resource: model?.uri
        }) : false;
    }
    _update() {
        if (this._disposed) {
            return;
        }
        this._codeActionOracle.value = undefined;
        this.setState(CodeActionsState.Empty);
        const model = this._editor.getModel();
        if (model && ( this._registry.has(model)) && !this._editor.getOption(EditorOption.readOnly)) {
            const supportedActions = this._registry.all(model).flatMap(provider => provider.providedCodeActionKinds ?? []);
            this._supportedCodeActions.set(supportedActions.join(" "));
            const oracle = ( new CodeActionOracle(this._editor, this._markerService, trigger => {
                if (!trigger) {
                    this.setState(CodeActionsState.Empty);
                    return;
                }
                const startPosition = trigger.selection.getStartPosition();
                const actions = createCancelablePromise(async token => {
                    if (this._settingEnabledNearbyQuickfixes() && trigger.trigger.type === CodeActionTriggerType.Invoke && (trigger.trigger.triggerAction === CodeActionTriggerSource.QuickFix || trigger.trigger.filter?.include?.contains(CodeActionKind.QuickFix))) {
                        const codeActionSet = await getCodeActions(
                            this._registry,
                            model,
                            trigger.selection,
                            trigger.trigger,
                            Progress.None,
                            token
                        );
                        this.codeActionsDisposable.value = codeActionSet;
                        const allCodeActions = [...codeActionSet.allActions];
                        if (token.isCancellationRequested) {
                            codeActionSet.dispose();
                            return emptyCodeActionSet;
                        }
                        const foundQuickfix = codeActionSet.validActions?.some(action => {
                            return action.action.kind && CodeActionKind.QuickFix.contains(( new HierarchicalKind(action.action.kind))) && !action.action.isAI;
                        });
                        const allMarkers = this._markerService.read({
                            resource: model.uri
                        });
                        if (foundQuickfix) {
                            for (const action of codeActionSet.validActions) {
                                if (action.action.command?.arguments?.some(arg => typeof arg === "string" && arg.includes(APPLY_FIX_ALL_COMMAND_ID))) {
                                    action.action.diagnostics = [...allMarkers.filter(marker => marker.relatedInformation)];
                                }
                            }
                            return {
                                validActions: codeActionSet.validActions,
                                allActions: allCodeActions,
                                documentation: codeActionSet.documentation,
                                hasAutoFix: codeActionSet.hasAutoFix,
                                hasAIFix: codeActionSet.hasAIFix,
                                allAIFixes: codeActionSet.allAIFixes,
                                dispose: () => {
                                    this.codeActionsDisposable.value = codeActionSet;
                                }
                            };
                        } else if (!foundQuickfix) {
                            if (allMarkers.length > 0) {
                                const currPosition = trigger.selection.getPosition();
                                let trackedPosition = currPosition;
                                let distance = Number.MAX_VALUE;
                                const currentActions = [...codeActionSet.validActions];
                                for (const marker of allMarkers) {
                                    const col = marker.endColumn;
                                    const row = marker.endLineNumber;
                                    const startRow = marker.startLineNumber;
                                    if ((row === currPosition.lineNumber || startRow === currPosition.lineNumber)) {
                                        trackedPosition = ( new Position(row, col));
                                        const newCodeActionTrigger = {
                                            type: trigger.trigger.type,
                                            triggerAction: trigger.trigger.triggerAction,
                                            filter: {
                                                include: trigger.trigger.filter?.include ? trigger.trigger.filter?.include : CodeActionKind.QuickFix
                                            },
                                            autoApply: trigger.trigger.autoApply,
                                            context: {
                                                notAvailableMessage: trigger.trigger.context?.notAvailableMessage || "",
                                                position: trackedPosition
                                            }
                                        };
                                        const selectionAsPosition = ( new Selection(
                                            trackedPosition.lineNumber,
                                            trackedPosition.column,
                                            trackedPosition.lineNumber,
                                            trackedPosition.column
                                        ));
                                        const actionsAtMarker = await getCodeActions(
                                            this._registry,
                                            model,
                                            selectionAsPosition,
                                            newCodeActionTrigger,
                                            Progress.None,
                                            token
                                        );
                                        if (token.isCancellationRequested) {
                                            actionsAtMarker.dispose();
                                            return emptyCodeActionSet;
                                        }
                                        if (actionsAtMarker.validActions.length !== 0) {
                                            for (const action of actionsAtMarker.validActions) {
                                                if (action.action.command?.arguments?.some(arg => typeof arg === "string" && arg.includes(APPLY_FIX_ALL_COMMAND_ID))) {
                                                    action.action.diagnostics = [...allMarkers.filter(marker => marker.relatedInformation)];
                                                }
                                            }
                                            if (codeActionSet.allActions.length === 0) {
                                                allCodeActions.push(...actionsAtMarker.allActions);
                                            }
                                            if (Math.abs(currPosition.column - col) < distance) {
                                                currentActions.unshift(...actionsAtMarker.validActions);
                                            } else {
                                                currentActions.push(...actionsAtMarker.validActions);
                                            }
                                        }
                                        distance = Math.abs(currPosition.column - col);
                                    }
                                }
                                const filteredActions = currentActions.filter(
                                    (action, index, self) => self.findIndex(a => a.action.title === action.action.title) === index
                                );
                                filteredActions.sort((a, b) => {
                                    if (a.action.isPreferred && !b.action.isPreferred) {
                                        return -1;
                                    } else if (!a.action.isPreferred && b.action.isPreferred) {
                                        return 1;
                                    } else if (a.action.isAI && !b.action.isAI) {
                                        return 1;
                                    } else if (!a.action.isAI && b.action.isAI) {
                                        return -1;
                                    } else {
                                        return 0;
                                    }
                                });
                                return {
                                    validActions: filteredActions,
                                    allActions: allCodeActions,
                                    documentation: codeActionSet.documentation,
                                    hasAutoFix: codeActionSet.hasAutoFix,
                                    hasAIFix: codeActionSet.hasAIFix,
                                    allAIFixes: codeActionSet.allAIFixes,
                                    dispose: () => {
                                        this.codeActionsDisposable.value = codeActionSet;
                                    }
                                };
                            }
                        }
                    }
                    if (trigger.trigger.type === CodeActionTriggerType.Invoke) {
                        const codeActions = await getCodeActions(
                            this._registry,
                            model,
                            trigger.selection,
                            trigger.trigger,
                            Progress.None,
                            token
                        );
                        this.codeActionsDisposable.value = codeActions;
                        return codeActions;
                    }
                    const codeActionSet = await getCodeActions(
                        this._registry,
                        model,
                        trigger.selection,
                        trigger.trigger,
                        Progress.None,
                        token
                    );
                    this.codeActionsDisposable.value = codeActionSet;
                    return codeActionSet;
                });
                if (trigger.trigger.type === CodeActionTriggerType.Invoke) {
                    this._progressService?.showWhile(actions, 250);
                }
                const newState = new CodeActionsState.Triggered(trigger.trigger, startPosition, actions);
                let isManualToAutoTransition = false;
                if (this._state.type === CodeActionsState.Type.Triggered) {
                    isManualToAutoTransition = this._state.trigger.type === CodeActionTriggerType.Invoke && newState.type === CodeActionsState.Type.Triggered && newState.trigger.type === CodeActionTriggerType.Auto && this._state.position !== newState.position;
                }
                if (!isManualToAutoTransition) {
                    this.setState(newState);
                } else {
                    setTimeout(() => {
                        this.setState(newState);
                    }, 500);
                }
            }, undefined));
            oracle.ignoreLightbulbOff = this._ignoreLightbulbOff;
            this._codeActionOracle.value = oracle;
            this._codeActionOracle.value.trigger({
                type: CodeActionTriggerType.Auto,
                triggerAction: CodeActionTriggerSource.Default
            });
        } else {
            this._supportedCodeActions.reset();
        }
    }
    trigger(trigger) {
        this._codeActionOracle.value?.trigger(trigger);
        this.codeActionsDisposable.dispose();
    }
    setState(newState, skipNotify) {
        if (newState === this._state) {
            return;
        }
        if (this._state.type === CodeActionsState.Type.Triggered) {
            this._state.cancel();
        }
        this._state = newState;
        if (!skipNotify && !this._disposed) {
            this._onDidChangeState.fire(newState);
        }
    }
}

export { APPLY_FIX_ALL_COMMAND_ID, CodeActionModel, CodeActionsState, SUPPORTED_CODE_ACTIONS };
