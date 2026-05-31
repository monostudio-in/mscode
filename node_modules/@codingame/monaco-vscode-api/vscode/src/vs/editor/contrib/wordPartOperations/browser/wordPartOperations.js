
import { KeyMod as KeyMod$1, KeyCode } from '../../../../base/common/keyCodes.js';
import { registerEditorCommand } from '../../../browser/editorExtensions.js';
import { WordNavigationType, WordPartOperations } from '../../../common/cursor/cursorWordOperations.js';
import { Range } from '../../../common/core/range.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { DeleteWordCommand, MoveWordCommand } from '../../wordOperations/browser/wordOperations.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';

class DeleteWordPartLeft extends DeleteWordCommand {
    constructor() {
        super({
            whitespaceHeuristics: true,
            wordNavigationType: WordNavigationType.WordStart,
            id: "deleteWordPartLeft",
            precondition: EditorContextKeys.writable,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: {
                    primary: KeyMod$1.WinCtrl | KeyMod$1.Alt | KeyCode.Backspace
                },
                weight: KeybindingWeight.EditorContrib
            }
        });
    }
    _delete(ctx, wordNavigationType) {
        const r = WordPartOperations.deleteWordPartLeft(ctx);
        if (r) {
            return r;
        }
        return ( new Range(1, 1, 1, 1));
    }
}
class DeleteWordPartRight extends DeleteWordCommand {
    constructor() {
        super({
            whitespaceHeuristics: true,
            wordNavigationType: WordNavigationType.WordEnd,
            id: "deleteWordPartRight",
            precondition: EditorContextKeys.writable,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: {
                    primary: KeyMod$1.WinCtrl | KeyMod$1.Alt | KeyCode.Delete
                },
                weight: KeybindingWeight.EditorContrib
            }
        });
    }
    _delete(ctx, wordNavigationType) {
        const r = WordPartOperations.deleteWordPartRight(ctx);
        if (r) {
            return r;
        }
        const lineCount = ctx.model.getLineCount();
        const maxColumn = ctx.model.getLineMaxColumn(lineCount);
        return ( new Range(lineCount, maxColumn, lineCount, maxColumn));
    }
}
class WordPartLeftCommand extends MoveWordCommand {
    _move(wordSeparators, model, position, wordNavigationType, hasMulticursor) {
        return WordPartOperations.moveWordPartLeft(wordSeparators, model, position, hasMulticursor);
    }
}
class CursorWordPartLeft extends WordPartLeftCommand {
    constructor() {
        super({
            inSelectionMode: false,
            wordNavigationType: WordNavigationType.WordStart,
            id: "cursorWordPartLeft",
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: {
                    primary: KeyMod$1.WinCtrl | KeyMod$1.Alt | KeyCode.LeftArrow
                },
                weight: KeybindingWeight.EditorContrib
            }
        });
    }
}
CommandsRegistry.registerCommandAlias("cursorWordPartStartLeft", "cursorWordPartLeft");
class CursorWordPartLeftSelect extends WordPartLeftCommand {
    constructor() {
        super({
            inSelectionMode: true,
            wordNavigationType: WordNavigationType.WordStart,
            id: "cursorWordPartLeftSelect",
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: {
                    primary: KeyMod$1.WinCtrl | KeyMod$1.Alt | KeyMod$1.Shift | KeyCode.LeftArrow
                },
                weight: KeybindingWeight.EditorContrib
            }
        });
    }
}
CommandsRegistry.registerCommandAlias("cursorWordPartStartLeftSelect", "cursorWordPartLeftSelect");
class WordPartRightCommand extends MoveWordCommand {
    _move(wordSeparators, model, position, wordNavigationType, hasMulticursor) {
        return WordPartOperations.moveWordPartRight(wordSeparators, model, position);
    }
}
class CursorWordPartRight extends WordPartRightCommand {
    constructor() {
        super({
            inSelectionMode: false,
            wordNavigationType: WordNavigationType.WordEnd,
            id: "cursorWordPartRight",
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: {
                    primary: KeyMod$1.WinCtrl | KeyMod$1.Alt | KeyCode.RightArrow
                },
                weight: KeybindingWeight.EditorContrib
            }
        });
    }
}
class CursorWordPartRightSelect extends WordPartRightCommand {
    constructor() {
        super({
            inSelectionMode: true,
            wordNavigationType: WordNavigationType.WordEnd,
            id: "cursorWordPartRightSelect",
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: {
                    primary: KeyMod$1.WinCtrl | KeyMod$1.Alt | KeyMod$1.Shift | KeyCode.RightArrow
                },
                weight: KeybindingWeight.EditorContrib
            }
        });
    }
}
registerEditorCommand(( new DeleteWordPartLeft()));
registerEditorCommand(( new DeleteWordPartRight()));
registerEditorCommand(( new CursorWordPartLeft()));
registerEditorCommand(( new CursorWordPartLeftSelect()));
registerEditorCommand(( new CursorWordPartRight()));
registerEditorCommand(( new CursorWordPartRightSelect()));

export { CursorWordPartLeft, CursorWordPartLeftSelect, CursorWordPartRight, CursorWordPartRightSelect, DeleteWordPartLeft, DeleteWordPartRight, WordPartLeftCommand, WordPartRightCommand };
