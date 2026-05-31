
import { KeyMod as KeyMod$1 } from '../../../../base/common/keyCodes.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerEditorContribution, EditorContributionInstantiation } from '../../../../editor/browser/editorExtensions.js';

class MenuPreventer extends Disposable {
    static { this.ID = 'editor.contrib.menuPreventer'; }
    constructor(editor) {
        super();
        this._editor = editor;
        this._altListeningMouse = false;
        this._altMouseTriggered = false;
        this._register(this._editor.onMouseDown((e) => {
            if (this._altListeningMouse) {
                this._altMouseTriggered = true;
            }
        }));
        this._register(this._editor.onKeyDown((e) => {
            if (e.equals(KeyMod$1.Alt)) {
                if (!this._altListeningMouse) {
                    this._altMouseTriggered = false;
                }
                this._altListeningMouse = true;
            }
        }));
        this._register(this._editor.onKeyUp((e) => {
            if (e.equals(KeyMod$1.Alt)) {
                if (this._altMouseTriggered) {
                    e.preventDefault();
                }
                this._altListeningMouse = false;
                this._altMouseTriggered = false;
            }
        }));
    }
}
registerEditorContribution(MenuPreventer.ID, MenuPreventer, EditorContributionInstantiation.BeforeFirstInteraction);

export { MenuPreventer };
