
import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import { Emitter } from '../../../base/common/event.js';
import { KeyMod as KeyMod$1, KeyChord } from '../../../base/common/keyCodes.js';
import { URI } from '../../../base/common/uri.js';
import { Position } from '../core/position.js';
import { Range } from '../core/range.js';
import { Selection } from '../core/selection.js';
import { Token } from '../languages.js';
import { MarkerTag, MarkerSeverity, SelectionDirection, KeyCode } from '../standalone/standaloneEnums.js';

class KeyMod {
    static { this.CtrlCmd = KeyMod$1.CtrlCmd; }
    static { this.Shift = KeyMod$1.Shift; }
    static { this.Alt = KeyMod$1.Alt; }
    static { this.WinCtrl = KeyMod$1.WinCtrl; }
    static chord(firstPart, secondPart) {
        return KeyChord(firstPart, secondPart);
    }
}
function createMonacoBaseAPI() {
    return {
        editor: undefined,
        languages: undefined,
        CancellationTokenSource: CancellationTokenSource,
        Emitter: Emitter,
        KeyCode: KeyCode,
        KeyMod: KeyMod,
        Position: Position,
        Range: Range,
        Selection: Selection,
        SelectionDirection: SelectionDirection,
        MarkerSeverity: MarkerSeverity,
        MarkerTag: MarkerTag,
        Uri: URI,
        Token: Token
    };
}

export { KeyMod, createMonacoBaseAPI };
