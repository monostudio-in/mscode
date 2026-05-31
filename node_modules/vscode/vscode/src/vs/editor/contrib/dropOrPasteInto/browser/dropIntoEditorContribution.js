
import { KeyMod as KeyMod$1, KeyCode } from '../../../../base/common/keyCodes.js';
import { KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { registerEditorContribution, EditorContributionInstantiation, registerEditorCommand, EditorCommand } from '../../../browser/editorExtensions.js';
import { registerEditorFeature } from '../../../common/editorFeatures.js';
import { DefaultDropProvidersFeature } from './defaultProviders.js';
import { DropIntoEditorController, dropWidgetVisibleCtx, changeDropTypeCommandId } from './dropIntoEditorController.js';

registerEditorContribution(DropIntoEditorController.ID, DropIntoEditorController, EditorContributionInstantiation.BeforeFirstInteraction);
registerEditorFeature(DefaultDropProvidersFeature);
registerEditorCommand(new class extends EditorCommand {
    constructor() {
        super({
            id: changeDropTypeCommandId,
            precondition: dropWidgetVisibleCtx,
            kbOpts: {
                weight: KeybindingWeight.EditorContrib,
                primary: KeyMod$1.CtrlCmd | KeyCode.Period,
            }
        });
    }
    runEditorCommand(_accessor, editor, _args) {
        DropIntoEditorController.get(editor)?.changeDropType();
    }
});
registerEditorCommand(new class extends EditorCommand {
    constructor() {
        super({
            id: 'editor.hideDropWidget',
            precondition: dropWidgetVisibleCtx,
            kbOpts: {
                weight: KeybindingWeight.EditorContrib,
                primary: KeyCode.Escape,
            }
        });
    }
    runEditorCommand(_accessor, editor, _args) {
        DropIntoEditorController.get(editor)?.clearWidgets();
    }
});
