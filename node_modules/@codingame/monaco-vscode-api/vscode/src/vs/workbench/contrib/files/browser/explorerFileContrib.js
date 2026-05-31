
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Registry } from '../../../../platform/registry/common/platform.js';

var ExplorerExtensions;
(function(ExplorerExtensions) {
    ExplorerExtensions["FileContributionRegistry"] = "workbench.registry.explorer.fileContributions";
})(ExplorerExtensions || (ExplorerExtensions = {}));
class ExplorerFileContributionRegistry extends Disposable {
    constructor() {
        super(...arguments);
        this._onDidRegisterDescriptor = this._register(( new Emitter()));
        this.onDidRegisterDescriptor = this._onDidRegisterDescriptor.event;
        this.descriptors = [];
    }
    register(descriptor) {
        this.descriptors.push(descriptor);
        this._onDidRegisterDescriptor.fire(descriptor);
    }
    create(insta, container, store) {
        return ( this.descriptors.map(d => {
            const i = d.create(insta, container);
            store.add(i);
            return i;
        }));
    }
}
const explorerFileContribRegistry = ( new ExplorerFileContributionRegistry());
Registry.add(ExplorerExtensions.FileContributionRegistry, explorerFileContribRegistry);

export { ExplorerExtensions, explorerFileContribRegistry };
