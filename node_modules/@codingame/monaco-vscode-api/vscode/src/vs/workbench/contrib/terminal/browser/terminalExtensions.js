
import { Registry } from '../../../../platform/registry/common/platform.js';

function registerTerminalContribution(id, ctor, canRunInDetachedTerminals = false) {
    TerminalContributionRegistry.INSTANCE.registerTerminalContribution({
        id,
        ctor,
        canRunInDetachedTerminals
    });
}
var TerminalExtensionsRegistry;
(function(TerminalExtensionsRegistry) {
    function getTerminalContributions() {
        return TerminalContributionRegistry.INSTANCE.getTerminalContributions();
    }
    TerminalExtensionsRegistry.getTerminalContributions = getTerminalContributions;
})(TerminalExtensionsRegistry || (TerminalExtensionsRegistry = {}));
class TerminalContributionRegistry {
    static {
        this.INSTANCE = ( new TerminalContributionRegistry());
    }
    constructor() {
        this._terminalContributions = [];
    }
    registerTerminalContribution(description) {
        this._terminalContributions.push(description);
    }
    getTerminalContributions() {
        return this._terminalContributions.slice(0);
    }
}
var Extensions;
(function(Extensions) {
    Extensions["TerminalContributions"] = "terminal.contributions";
})(Extensions || (Extensions = {}));
Registry.add(Extensions.TerminalContributions, TerminalContributionRegistry.INSTANCE);

export { TerminalExtensionsRegistry, registerTerminalContribution };
