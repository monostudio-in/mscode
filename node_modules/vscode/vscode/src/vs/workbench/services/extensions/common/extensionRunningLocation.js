
import { ExtensionHostKind } from './extensionHostKind.js';

class LocalProcessRunningLocation {
    constructor(affinity) {
        this.affinity = affinity;
        this.kind = ExtensionHostKind.LocalProcess;
    }
    equals(other) {
        return (this.kind === other.kind && this.affinity === other.affinity);
    }
    asString() {
        if (this.affinity === 0) {
            return 'LocalProcess';
        }
        return `LocalProcess${this.affinity}`;
    }
}
class LocalWebWorkerRunningLocation {
    constructor(affinity) {
        this.affinity = affinity;
        this.kind = ExtensionHostKind.LocalWebWorker;
    }
    equals(other) {
        return (this.kind === other.kind && this.affinity === other.affinity);
    }
    asString() {
        if (this.affinity === 0) {
            return 'LocalWebWorker';
        }
        return `LocalWebWorker${this.affinity}`;
    }
}
class RemoteRunningLocation {
    constructor() {
        this.kind = ExtensionHostKind.Remote;
        this.affinity = 0;
    }
    equals(other) {
        return (this.kind === other.kind);
    }
    asString() {
        return 'Remote';
    }
}

export { LocalProcessRunningLocation, LocalWebWorkerRunningLocation, RemoteRunningLocation };
