
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { emptyProgressRunner } from '../../../../platform/progress/common/progress.js';
import { GroupModelChangeKind } from '../../../common/editor.js';

class EditorProgressIndicator extends Disposable {
    constructor(progressBar, group) {
        super();
        this.progressBar = progressBar;
        this.group = group;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.group.onDidModelChange(e => {
            if (e.kind === GroupModelChangeKind.EDITOR_ACTIVE || (e.kind === GroupModelChangeKind.EDITOR_CLOSE && this.group.isEmpty)) {
                this.progressBar.stop().hide();
            }
        }));
    }
    show(infiniteOrTotal, delay) {
        if (this.group.isEmpty) {
            return emptyProgressRunner;
        }
        if (infiniteOrTotal === true) {
            return this.doShow(true, delay);
        }
        return this.doShow(infiniteOrTotal, delay);
    }
    doShow(infiniteOrTotal, delay) {
        if (typeof infiniteOrTotal === "boolean") {
            this.progressBar.infinite().show(delay);
        } else {
            this.progressBar.total(infiniteOrTotal).show(delay);
        }
        return {
            total: total => {
                this.progressBar.total(total);
            },
            worked: worked => {
                if (this.progressBar.hasTotal()) {
                    this.progressBar.worked(worked);
                } else {
                    this.progressBar.infinite().show();
                }
            },
            done: () => {
                this.progressBar.stop().hide();
            }
        };
    }
    async showWhile(promise, delay) {
        if (this.group.isEmpty) {
            try {
                await promise;
            } catch (error) {}
        }
        return this.doShowWhile(promise, delay);
    }
    async doShowWhile(promise, delay) {
        try {
            this.progressBar.infinite().show(delay);
            await promise;
        } catch (error) {} finally {
            this.progressBar.stop().hide();
        }
    }
}
var ProgressIndicatorState;
(function(ProgressIndicatorState) {
    let Type;
    (function(Type) {
        Type[Type["None"] = 0] = "None";
        Type[Type["Done"] = 1] = "Done";
        Type[Type["Infinite"] = 2] = "Infinite";
        Type[Type["While"] = 3] = "While";
        Type[Type["Work"] = 4] = "Work";
    })(Type = ProgressIndicatorState.Type || (ProgressIndicatorState.Type = {}));
    ProgressIndicatorState.None = {
        type: Type.None
    };
    ProgressIndicatorState.Done = {
        type: Type.Done
    };
    ProgressIndicatorState.Infinite = {
        type: Type.Infinite
    };
    class While {
        constructor(whilePromise, whileStart, whileDelay) {
            this.whilePromise = whilePromise;
            this.whileStart = whileStart;
            this.whileDelay = whileDelay;
            this.type = Type.While;
        }
    }
    ProgressIndicatorState.While = While;
    class Work {
        constructor(total, worked) {
            this.total = total;
            this.worked = worked;
            this.type = Type.Work;
        }
    }
    ProgressIndicatorState.Work = Work;
})(ProgressIndicatorState || (ProgressIndicatorState = {}));
class ScopedProgressIndicator extends Disposable {
    constructor(progressBar, scope) {
        super();
        this.progressBar = progressBar;
        this.scope = scope;
        this.progressState = ProgressIndicatorState.None;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.scope.onDidChangeActive(() => {
            if (this.scope.isActive) {
                this.onDidScopeActivate();
            } else {
                this.onDidScopeDeactivate();
            }
        }));
    }
    onDidScopeActivate() {
        if (this.progressState.type === ProgressIndicatorState.Done.type) {
            return;
        }
        if (this.progressState.type === ProgressIndicatorState.Type.While) {
            let delay;
            if (this.progressState.whileDelay > 0) {
                const remainingDelay = this.progressState.whileDelay - (Date.now() - this.progressState.whileStart);
                if (remainingDelay > 0) {
                    delay = remainingDelay;
                }
            }
            this.doShowWhile(delay);
        }
        else if (this.progressState.type === ProgressIndicatorState.Type.Infinite) {
            this.progressBar.infinite().show();
        }
        else if (this.progressState.type === ProgressIndicatorState.Type.Work) {
            if (this.progressState.total) {
                this.progressBar.total(this.progressState.total).show();
            }
            if (this.progressState.worked) {
                this.progressBar.worked(this.progressState.worked).show();
            }
        }
    }
    onDidScopeDeactivate() {
        this.progressBar.stop().hide();
    }
    show(infiniteOrTotal, delay) {
        if (typeof infiniteOrTotal === "boolean") {
            this.progressState = ProgressIndicatorState.Infinite;
        } else {
            this.progressState = new ProgressIndicatorState.Work(infiniteOrTotal, undefined);
        }
        if (this.scope.isActive) {
            if (this.progressState.type === ProgressIndicatorState.Type.Infinite) {
                this.progressBar.infinite().show(delay);
            }
            else if (this.progressState.type === ProgressIndicatorState.Type.Work && typeof this.progressState.total === "number") {
                this.progressBar.total(this.progressState.total).show(delay);
            }
        }
        return {
            total: total => {
                this.progressState = new ProgressIndicatorState.Work(
                    total,
                    this.progressState.type === ProgressIndicatorState.Type.Work ? this.progressState.worked : undefined
                );
                if (this.scope.isActive) {
                    this.progressBar.total(total);
                }
            },
            worked: worked => {
                if (!this.scope.isActive || this.progressBar.hasTotal()) {
                    this.progressState = new ProgressIndicatorState.Work(
                        this.progressState.type === ProgressIndicatorState.Type.Work ? this.progressState.total : undefined,
                        this.progressState.type === ProgressIndicatorState.Type.Work && typeof this.progressState.worked === "number" ? this.progressState.worked + worked : worked
                    );
                    if (this.scope.isActive) {
                        this.progressBar.worked(worked);
                    }
                }
                else {
                    this.progressState = ProgressIndicatorState.Infinite;
                    this.progressBar.infinite().show();
                }
            },
            done: () => {
                this.progressState = ProgressIndicatorState.Done;
                if (this.scope.isActive) {
                    this.progressBar.stop().hide();
                }
            }
        };
    }
    async showWhile(promise, delay) {
        if (this.progressState.type === ProgressIndicatorState.Type.While) {
            promise = Promise.allSettled([promise, this.progressState.whilePromise]);
        }
        this.progressState = new ProgressIndicatorState.While(promise, delay || 0, Date.now());
        try {
            this.doShowWhile(delay);
            await promise;
        } catch (error) {} finally {
            if (this.progressState.type !== ProgressIndicatorState.Type.While || this.progressState.whilePromise === promise) {
                this.progressState = ProgressIndicatorState.None;
                if (this.scope.isActive) {
                    this.progressBar.stop().hide();
                }
            }
        }
    }
    doShowWhile(delay) {
        if (this.scope.isActive) {
            this.progressBar.infinite().show(delay);
        }
    }
}
class AbstractProgressScope extends Disposable {
    get isActive() {
        return this._isActive;
    }
    constructor(scopeId, _isActive) {
        super();
        this.scopeId = scopeId;
        this._isActive = _isActive;
        this._onDidChangeActive = this._register(( new Emitter()));
        this.onDidChangeActive = this._onDidChangeActive.event;
    }
    onScopeOpened(scopeId) {
        if (scopeId === this.scopeId) {
            if (!this._isActive) {
                this._isActive = true;
                this._onDidChangeActive.fire();
            }
        }
    }
    onScopeClosed(scopeId) {
        if (scopeId === this.scopeId) {
            if (this._isActive) {
                this._isActive = false;
                this._onDidChangeActive.fire();
            }
        }
    }
}

export { AbstractProgressScope, EditorProgressIndicator, ScopedProgressIndicator };
