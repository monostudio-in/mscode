
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.js';
import { Lazy } from '../../../../base/common/lazy.js';
import { refactorCommandId, codeActionCommandId, sourceActionCommandId, organizeImportsCommandId, fixAllCommandId } from './codeAction.js';
import { CodeActionKind, CodeActionCommandArgs, CodeActionAutoApply } from '../common/types.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.service.js';

var CodeActionKeybindingResolver_1;
let CodeActionKeybindingResolver = class CodeActionKeybindingResolver {
    static {
        CodeActionKeybindingResolver_1 = this;
    }
    static {
        this.codeActionCommands = [
            refactorCommandId,
            codeActionCommandId,
            sourceActionCommandId,
            organizeImportsCommandId,
            fixAllCommandId
        ];
    }
    constructor(keybindingService) {
        this.keybindingService = keybindingService;
    }
    getResolver() {
        const allCodeActionBindings = ( new Lazy(() => ( this.keybindingService.getKeybindings().filter(
            item => CodeActionKeybindingResolver_1.codeActionCommands.indexOf(item.command) >= 0
        ).filter(item => item.resolvedKeybinding).map(item => {
            let commandArgs = item.commandArgs;
            if (item.command === organizeImportsCommandId) {
                commandArgs = {
                    kind: CodeActionKind.SourceOrganizeImports.value
                };
            } else if (item.command === fixAllCommandId) {
                commandArgs = {
                    kind: CodeActionKind.SourceFixAll.value
                };
            }
            return {
                resolvedKeybinding: item.resolvedKeybinding,
                ...CodeActionCommandArgs.fromUser(commandArgs, {
                    kind: HierarchicalKind.None,
                    apply: CodeActionAutoApply.Never
                })
            };
        }))));
        return action => {
            if (action.kind) {
                const binding = this.bestKeybindingForCodeAction(action, allCodeActionBindings.value);
                return binding?.resolvedKeybinding;
            }
            return undefined;
        };
    }
    bestKeybindingForCodeAction(action, candidates) {
        if (!action.kind) {
            return undefined;
        }
        const kind = ( new HierarchicalKind(action.kind));
        return candidates.filter(candidate => candidate.kind.contains(kind)).filter(candidate => {
            if (candidate.preferred) {
                return action.isPreferred;
            }
            return true;
        }).reduceRight((currentBest, candidate) => {
            if (!currentBest) {
                return candidate;
            }
            return currentBest.kind.contains(candidate.kind) ? candidate : currentBest;
        }, undefined);
    }
};
CodeActionKeybindingResolver = CodeActionKeybindingResolver_1 = ( __decorate([( __param(0, IKeybindingService))], CodeActionKeybindingResolver));

export { CodeActionKeybindingResolver };
