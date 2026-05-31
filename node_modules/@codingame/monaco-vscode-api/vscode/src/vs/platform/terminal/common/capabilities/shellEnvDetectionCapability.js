
import { Disposable } from '../../../../base/common/lifecycle.js';
import { TerminalCapability } from './capabilities.js';
import { Emitter } from '../../../../base/common/event.js';
import { equals } from '../../../../base/common/objects.js';
import { mapsStrictEqualIgnoreOrder } from '../../../../base/common/map.js';

class ShellEnvDetectionCapability extends Disposable {
    constructor() {
        super(...arguments);
        this.type = TerminalCapability.ShellEnvDetection;
        this._env = {
            value: ( new Map()),
            isTrusted: true
        };
        this._onDidChangeEnv = this._register(( new Emitter()));
        this.onDidChangeEnv = this._onDidChangeEnv.event;
    }
    get env() {
        return this._createStateObject();
    }
    setEnvironment(env, isTrusted) {
        if (equals(this.env.value, env)) {
            return;
        }
        this._env.value.clear();
        for (const [key, value] of Object.entries(env)) {
            if (value !== undefined) {
                this._env.value.set(key, value);
            }
        }
        this._env.isTrusted = isTrusted;
        this._fireEnvChange();
    }
    startEnvironmentSingleVar(clear, isTrusted) {
        if (clear) {
            this._pendingEnv = {
                value: ( new Map()),
                isTrusted
            };
        } else {
            this._pendingEnv = {
                value: ( new Map(this._env.value)),
                isTrusted: this._env.isTrusted && isTrusted
            };
        }
    }
    setEnvironmentSingleVar(key, value, isTrusted) {
        if (!this._pendingEnv) {
            return;
        }
        if (key !== undefined && value !== undefined) {
            this._pendingEnv.value.set(key, value);
            this._pendingEnv.isTrusted &&= isTrusted;
        }
    }
    endEnvironmentSingleVar(isTrusted) {
        if (!this._pendingEnv) {
            return;
        }
        this._pendingEnv.isTrusted &&= isTrusted;
        const envDiffers = !mapsStrictEqualIgnoreOrder(this._env.value, this._pendingEnv.value);
        if (envDiffers) {
            this._env = this._pendingEnv;
            this._fireEnvChange();
        }
        this._pendingEnv = undefined;
    }
    deleteEnvironmentSingleVar(key, value, isTrusted) {
        if (!this._pendingEnv) {
            return;
        }
        if (key !== undefined && value !== undefined) {
            this._pendingEnv.value.delete(key);
            this._pendingEnv.isTrusted &&= isTrusted;
        }
    }
    _fireEnvChange() {
        this._onDidChangeEnv.fire(this._createStateObject());
    }
    _createStateObject() {
        return {
            value: Object.fromEntries(this._env.value),
            isTrusted: this._env.isTrusted
        };
    }
}

export { ShellEnvDetectionCapability };
