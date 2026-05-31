
import { Derived } from '../observables/derivedImpl.js';
import { FromEventObservable } from '../observables/observableFromEvent.js';
import { ObservableValue } from '../observables/observableValue.js';
import { AutorunObserver } from '../reactions/autorunImpl.js';
import { formatValue } from './consoleObservableLogger.js';

function debugGetObservableGraph(obs, options) {
    const debugNamePostProcessor = options?.debugNamePostProcessor ?? (str => str);
    const info = Info.from(obs, debugNamePostProcessor);
    if (!info) {
        return "";
    }
    const alreadyListed = ( new Set());
    if (options.type === "observers") {
        return formatObservableInfoWithObservers(info, 0, alreadyListed, options).trim();
    } else {
        return formatObservableInfoWithDependencies(info, 0, alreadyListed, options).trim();
    }
}
function formatObservableInfoWithDependencies(info, indentLevel, alreadyListed, options) {
    const indent = "\t\t".repeat(indentLevel);
    const lines = [];
    const isAlreadyListed = ( alreadyListed.has(info.sourceObj));
    if (isAlreadyListed) {
        lines.push(`${indent}* ${info.type} ${info.name} (already listed)`);
        return lines.join("\n");
    }
    alreadyListed.add(info.sourceObj);
    lines.push(`${indent}* ${info.type} ${info.name}:`);
    lines.push(`${indent}  value: ${formatValue(info.value, 50)}`);
    lines.push(`${indent}  state: ${info.state}`);
    if (info.dependencies.length > 0) {
        lines.push(`${indent}  dependencies:`);
        for (const dep of info.dependencies) {
            const info = Info.from(dep, options.debugNamePostProcessor ?? (name => name)) ?? Info.unknown(dep);
            lines.push(
                formatObservableInfoWithDependencies(info, indentLevel + 1, alreadyListed, options)
            );
        }
    }
    return lines.join("\n");
}
function formatObservableInfoWithObservers(info, indentLevel, alreadyListed, options) {
    const indent = "\t\t".repeat(indentLevel);
    const lines = [];
    const isAlreadyListed = ( alreadyListed.has(info.sourceObj));
    if (isAlreadyListed) {
        lines.push(`${indent}* ${info.type} ${info.name} (already listed)`);
        return lines.join("\n");
    }
    alreadyListed.add(info.sourceObj);
    lines.push(`${indent}* ${info.type} ${info.name}:`);
    lines.push(`${indent}  value: ${formatValue(info.value, 50)}`);
    lines.push(`${indent}  state: ${info.state}`);
    if (info.observers.length > 0) {
        lines.push(`${indent}  observers:`);
        for (const observer of info.observers) {
            const info = Info.from(observer, options.debugNamePostProcessor ?? (name => name)) ?? Info.unknown(observer);
            lines.push(
                formatObservableInfoWithObservers(info, indentLevel + 1, alreadyListed, options)
            );
        }
    }
    return lines.join("\n");
}
class Info {
    static from(obs, debugNamePostProcessor) {
        if (obs instanceof AutorunObserver) {
            const state = obs.debugGetState();
            return ( new Info(
                obs,
                debugNamePostProcessor(obs.debugName),
                "autorun",
                undefined,
                state.stateStr,
                Array.from(state.dependencies),
                []
            ));
        } else if (obs instanceof Derived) {
            const state = obs.debugGetState();
            return ( new Info(
                obs,
                debugNamePostProcessor(obs.debugName),
                "derived",
                state.value,
                state.stateStr,
                Array.from(state.dependencies),
                Array.from(obs.debugGetObservers())
            ));
        } else if (obs instanceof ObservableValue) {
            const state = obs.debugGetState();
            return ( new Info(
                obs,
                debugNamePostProcessor(obs.debugName),
                "observableValue",
                state.value,
                "upToDate",
                [],
                Array.from(obs.debugGetObservers())
            ));
        } else if (obs instanceof FromEventObservable) {
            const state = obs.debugGetState();
            return ( new Info(
                obs,
                debugNamePostProcessor(obs.debugName),
                "fromEvent",
                state.value,
                state.hasValue ? "upToDate" : "initial",
                [],
                Array.from(obs.debugGetObservers())
            ));
        }
        return undefined;
    }
    static unknown(obs) {
        return ( new Info(obs, "(unknown)", "unknown", undefined, "unknown", [], []));
    }
    constructor(sourceObj, name, type, value, state, dependencies, observers) {
        this.sourceObj = sourceObj;
        this.name = name;
        this.type = type;
        this.value = value;
        this.state = state;
        this.dependencies = dependencies;
        this.observers = observers;
    }
}

export { debugGetObservableGraph };
