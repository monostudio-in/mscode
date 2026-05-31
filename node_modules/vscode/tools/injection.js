
import { _util } from '../vscode/src/vs/platform/instantiation/common/instantiation.js';

function getInjectedParameters(instantiationService, ctor) {
    return instantiationService.invokeFunction((accessor) => {
        return _util
            .getServiceDependencies(ctor)
            .sort((a, b) => a.index - b.index)
            .map((d) => accessor.get(d.id));
    });
}
function createInjectedClass(ctor) {
    const _ctor = ctor;
    return class extends _ctor {
        constructor(...args) {
            super(...args.slice(1), ...getInjectedParameters(args[0], ctor));
        }
    };
}

export { createInjectedClass };
