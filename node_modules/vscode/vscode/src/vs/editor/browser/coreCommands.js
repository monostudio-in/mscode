
import { localize } from '../../nls.js';
import { isFirefox } from '../../base/browser/browser.js';
import { KeyMod as KeyMod$1, KeyCode } from '../../base/common/keyCodes.js';
import { isObject, isString, isUndefined, isNumber, isBoolean } from '../../base/common/types.js';
import { status } from '../../base/browser/ui/aria/aria.js';
import { EditorCommand, registerEditorCommand, SelectAllCommand, UndoCommand, RedoCommand, Command } from './editorExtensions.js';
import { ICodeEditorService } from './services/codeEditorService.service.js';
import { ColumnSelection } from '../common/cursor/cursorColumnSelection.js';
import { CursorState, EditOperationType } from '../common/cursorCommon.js';
import { DeleteOperations } from '../common/cursor/cursorDeleteOperations.js';
import { CursorChangeReason } from '../common/cursorEvents.js';
import { CursorMoveCommands, CursorMove } from '../common/cursor/cursorMoveCommands.js';
import { TypeOperations } from '../common/cursor/cursorTypeOperations.js';
import { Position } from '../common/core/position.js';
import { Range } from '../common/core/range.js';
import { ScrollType, Handler } from '../common/editorCommon.js';
import { EditorContextKeys } from '../common/editorContextKeys.js';
import { VerticalRevealType } from '../common/viewEvents.js';
import { ContextKeyExpr } from '../../platform/contextkey/common/contextkey.js';
import { KeybindingWeight, KeybindingsRegistry } from '../../platform/keybinding/common/keybindingsRegistry.js';
import { EditorOption } from '../common/config/editorOptions.js';
import { getActiveElement, isEditableElement } from '../../base/browser/dom.js';
import { EnterOperation } from '../common/cursor/cursorTypeEditOperations.js';
import { TextEditorSelectionSource } from '../../platform/editor/common/editor.js';

const CORE_WEIGHT = KeybindingWeight.EditorCore;
class CoreEditorCommand extends EditorCommand {
    runEditorCommand(accessor, editor, args) {
        const viewModel = editor._getViewModel();
        if (!viewModel) {
            return;
        }
        this.runCoreEditorCommand(viewModel, args || {});
    }
}
var EditorScroll_;
(function(EditorScroll_) {
    const isEditorScrollArgs = function(arg) {
        if (!isObject(arg)) {
            return false;
        }
        const scrollArg = arg;
        if (!isString(scrollArg.to)) {
            return false;
        }
        if (!isUndefined(scrollArg.by) && !isString(scrollArg.by)) {
            return false;
        }
        if (!isUndefined(scrollArg.value) && !isNumber(scrollArg.value)) {
            return false;
        }
        if (!isUndefined(scrollArg.revealCursor) && !isBoolean(scrollArg.revealCursor)) {
            return false;
        }
        return true;
    };
    EditorScroll_.metadata = {
        description: "Scroll editor in the given direction",
        args: [{
            name: "Editor scroll argument object",
            description: `Property-value pairs that can be passed through this argument:
                    * 'to': A mandatory direction value.
                        \`\`\`
                        'up', 'down'
                        \`\`\`
                    * 'by': Unit to move. Default is computed based on 'to' value.
                        \`\`\`
                        'line', 'wrappedLine', 'page', 'halfPage', 'editor'
                        \`\`\`
                    * 'value': Number of units to move. Default is '1'.
                    * 'revealCursor': If 'true' reveals the cursor if it is outside view port.
                `,
            constraint: isEditorScrollArgs,
            schema: {
                "type": "object",
                "required": ["to"],
                "properties": {
                    "to": {
                        "type": "string",
                        "enum": ["up", "down"]
                    },
                    "by": {
                        "type": "string",
                        "enum": ["line", "wrappedLine", "page", "halfPage", "editor"]
                    },
                    "value": {
                        "type": "number",
                        "default": 1
                    },
                    "revealCursor": {
                        "type": "boolean"
                    }
                }
            }
        }]
    };
    EditorScroll_.RawDirection = {
        Up: "up",
        Right: "right",
        Down: "down",
        Left: "left"
    };
    EditorScroll_.RawUnit = {
        Line: "line",
        WrappedLine: "wrappedLine",
        Page: "page",
        HalfPage: "halfPage",
        Editor: "editor",
        Column: "column"
    };
    function parse(args) {
        let direction;
        switch (args.to) {
        case EditorScroll_.RawDirection.Up:
            direction = Direction.Up;
            break;
        case EditorScroll_.RawDirection.Right:
            direction = Direction.Right;
            break;
        case EditorScroll_.RawDirection.Down:
            direction = Direction.Down;
            break;
        case EditorScroll_.RawDirection.Left:
            direction = Direction.Left;
            break;
        default:
            return null;
        }
        let unit;
        switch (args.by) {
        case EditorScroll_.RawUnit.Line:
            unit = Unit.Line;
            break;
        case EditorScroll_.RawUnit.WrappedLine:
            unit = Unit.WrappedLine;
            break;
        case EditorScroll_.RawUnit.Page:
            unit = Unit.Page;
            break;
        case EditorScroll_.RawUnit.HalfPage:
            unit = Unit.HalfPage;
            break;
        case EditorScroll_.RawUnit.Editor:
            unit = Unit.Editor;
            break;
        case EditorScroll_.RawUnit.Column:
            unit = Unit.Column;
            break;
        default:
            unit = Unit.WrappedLine;
        }
        const value = Math.floor(args.value || 1);
        const revealCursor = !!args.revealCursor;
        return {
            direction: direction,
            unit: unit,
            value: value,
            revealCursor: revealCursor,
            select: (!!args.select)
        };
    }
    EditorScroll_.parse = parse;
    let Direction;
    (function(Direction) {
        Direction[Direction["Up"] = 1] = "Up";
        Direction[Direction["Right"] = 2] = "Right";
        Direction[Direction["Down"] = 3] = "Down";
        Direction[Direction["Left"] = 4] = "Left";
    })(Direction = EditorScroll_.Direction || (EditorScroll_.Direction = {}));
    let Unit;
    (function(Unit) {
        Unit[Unit["Line"] = 1] = "Line";
        Unit[Unit["WrappedLine"] = 2] = "WrappedLine";
        Unit[Unit["Page"] = 3] = "Page";
        Unit[Unit["HalfPage"] = 4] = "HalfPage";
        Unit[Unit["Editor"] = 5] = "Editor";
        Unit[Unit["Column"] = 6] = "Column";
    })(Unit = EditorScroll_.Unit || (EditorScroll_.Unit = {}));
})(EditorScroll_ || (EditorScroll_ = {}));
var RevealLine_;
(function(RevealLine_) {
    const isRevealLineArgs = function(arg) {
        if (!isObject(arg)) {
            return false;
        }
        const reveaLineArg = arg;
        if (!isNumber(reveaLineArg.lineNumber) && !isString(reveaLineArg.lineNumber)) {
            return false;
        }
        if (!isUndefined(reveaLineArg.at) && !isString(reveaLineArg.at)) {
            return false;
        }
        return true;
    };
    RevealLine_.metadata = {
        description: "Reveal the given line at the given logical position",
        args: [{
            name: "Reveal line argument object",
            description: `Property-value pairs that can be passed through this argument:
                    * 'lineNumber': A mandatory line number value.
                    * 'at': Logical position at which line has to be revealed.
                        \`\`\`
                        'top', 'center', 'bottom'
                        \`\`\`
                `,
            constraint: isRevealLineArgs,
            schema: {
                "type": "object",
                "required": ["lineNumber"],
                "properties": {
                    "lineNumber": {
                        "type": ["number", "string"]
                    },
                    "at": {
                        "type": "string",
                        "enum": ["top", "center", "bottom"]
                    }
                }
            }
        }]
    };
    RevealLine_.RawAtArgument = {
        Top: "top",
        Center: "center",
        Bottom: "bottom"
    };
})(RevealLine_ || (RevealLine_ = {}));
class EditorOrNativeTextInputCommand {
    constructor(target) {
        target.addImplementation(10000, "code-editor", (accessor, args) => {
            const focusedEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
            if (focusedEditor && focusedEditor.hasTextFocus()) {
                return this._runEditorCommand(accessor, focusedEditor, args);
            }
            return false;
        });
        target.addImplementation(1000, "generic-dom-input-textarea", (accessor, args) => {
            const activeElement = getActiveElement();
            if (activeElement && isEditableElement(activeElement)) {
                this.runDOMCommand(activeElement);
                return true;
            }
            return false;
        });
        target.addImplementation(0, "generic-dom", (accessor, args) => {
            const activeEditor = accessor.get(ICodeEditorService).getActiveCodeEditor();
            if (activeEditor) {
                activeEditor.focus();
                return this._runEditorCommand(accessor, activeEditor, args);
            }
            return false;
        });
    }
    _runEditorCommand(accessor, editor, args) {
        const result = this.runEditorCommand(accessor, editor, args);
        if (result) {
            return result;
        }
        return true;
    }
}
var NavigationCommandRevealType;
(function(NavigationCommandRevealType) {
    NavigationCommandRevealType[NavigationCommandRevealType["Regular"] = 0] = "Regular";
    NavigationCommandRevealType[NavigationCommandRevealType["Minimal"] = 1] = "Minimal";
    NavigationCommandRevealType[NavigationCommandRevealType["None"] = 2] = "None";
})(NavigationCommandRevealType || (NavigationCommandRevealType = {}));
var CoreNavigationCommands;
(function(CoreNavigationCommands) {
    class BaseMoveToCommand extends CoreEditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
        }
        runCoreEditorCommand(viewModel, args) {
            if (!args.position) {
                return;
            }
            viewModel.model.pushStackElement();
            const cursorStateChanged = viewModel.setCursorStates(args.source, CursorChangeReason.Explicit, [CursorMoveCommands.moveTo(
                viewModel,
                viewModel.getPrimaryCursorState(),
                this._inSelectionMode,
                args.position,
                args.viewPosition
            )]);
            if (cursorStateChanged && args.revealType !== NavigationCommandRevealType.None) {
                viewModel.revealAllCursors(args.source, true, true);
            }
        }
    }
    CoreNavigationCommands.MoveTo = registerEditorCommand(( new BaseMoveToCommand({
        id: "_moveTo",
        inSelectionMode: false,
        precondition: undefined
    })));
    CoreNavigationCommands.MoveToSelect = registerEditorCommand(( new BaseMoveToCommand({
        id: "_moveToSelect",
        inSelectionMode: true,
        precondition: undefined
    })));
    class ColumnSelectCommand extends CoreEditorCommand {
        runCoreEditorCommand(viewModel, args) {
            viewModel.model.pushStackElement();
            const result = this._getColumnSelectResult(
                viewModel,
                viewModel.getPrimaryCursorState(),
                viewModel.getCursorColumnSelectData(),
                args
            );
            if (result === null) {
                return;
            }
            viewModel.setCursorStates(args.source, CursorChangeReason.Explicit, ( result.viewStates.map(viewState => CursorState.fromViewState(viewState))));
            viewModel.setCursorColumnSelectData({
                isReal: true,
                fromViewLineNumber: result.fromLineNumber,
                fromViewVisualColumn: result.fromVisualColumn,
                toViewLineNumber: result.toLineNumber,
                toViewVisualColumn: result.toVisualColumn
            });
            if (result.reversed) {
                viewModel.revealTopMostCursor(args.source);
            } else {
                viewModel.revealBottomMostCursor(args.source);
            }
        }
    }
    CoreNavigationCommands.ColumnSelect = registerEditorCommand(new (class extends ColumnSelectCommand {
        constructor() {
            super({
                id: "columnSelect",
                precondition: undefined
            });
        }
        _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
            if (typeof args.position === "undefined" || typeof args.viewPosition === "undefined" || typeof args.mouseColumn === "undefined") {
                return null;
            }
            const validatedPosition = viewModel.model.validatePosition(args.position);
            const validatedViewPosition = viewModel.coordinatesConverter.validateViewPosition(( new Position(args.viewPosition.lineNumber, args.viewPosition.column)), validatedPosition);
            const fromViewLineNumber = args.doColumnSelect ? prevColumnSelectData.fromViewLineNumber : validatedViewPosition.lineNumber;
            const fromViewVisualColumn = args.doColumnSelect ? prevColumnSelectData.fromViewVisualColumn : args.mouseColumn - 1;
            return ColumnSelection.columnSelect(
                viewModel.cursorConfig,
                viewModel,
                fromViewLineNumber,
                fromViewVisualColumn,
                validatedViewPosition.lineNumber,
                args.mouseColumn - 1
            );
        }
    })());
    CoreNavigationCommands.CursorColumnSelectLeft = registerEditorCommand(new (class extends ColumnSelectCommand {
        constructor() {
            super({
                id: "cursorColumnSelectLeft",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus,
                    primary: KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyMod$1.Alt | KeyCode.LeftArrow,
                    linux: {
                        primary: 0
                    }
                }
            });
        }
        _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
            return ColumnSelection.columnSelectLeft(viewModel.cursorConfig, viewModel, prevColumnSelectData);
        }
    })());
    CoreNavigationCommands.CursorColumnSelectRight = registerEditorCommand(new (class extends ColumnSelectCommand {
        constructor() {
            super({
                id: "cursorColumnSelectRight",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus,
                    primary: KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyMod$1.Alt | KeyCode.RightArrow,
                    linux: {
                        primary: 0
                    }
                }
            });
        }
        _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
            return ColumnSelection.columnSelectRight(viewModel.cursorConfig, viewModel, prevColumnSelectData);
        }
    })());
    class ColumnSelectUpCommand extends ColumnSelectCommand {
        constructor(opts) {
            super(opts);
            this._isPaged = opts.isPaged;
        }
        _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
            return ColumnSelection.columnSelectUp(viewModel.cursorConfig, viewModel, prevColumnSelectData, this._isPaged);
        }
    }
    CoreNavigationCommands.CursorColumnSelectUp = registerEditorCommand(( new ColumnSelectUpCommand({
        isPaged: false,
        id: "cursorColumnSelectUp",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyMod$1.Alt | KeyCode.UpArrow,
            linux: {
                primary: 0
            }
        }
    })));
    CoreNavigationCommands.CursorColumnSelectPageUp = registerEditorCommand(( new ColumnSelectUpCommand({
        isPaged: true,
        id: "cursorColumnSelectPageUp",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyMod$1.Alt | KeyCode.PageUp,
            linux: {
                primary: 0
            }
        }
    })));
    class ColumnSelectDownCommand extends ColumnSelectCommand {
        constructor(opts) {
            super(opts);
            this._isPaged = opts.isPaged;
        }
        _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
            return ColumnSelection.columnSelectDown(viewModel.cursorConfig, viewModel, prevColumnSelectData, this._isPaged);
        }
    }
    CoreNavigationCommands.CursorColumnSelectDown = registerEditorCommand(( new ColumnSelectDownCommand({
        isPaged: false,
        id: "cursorColumnSelectDown",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyMod$1.Alt | KeyCode.DownArrow,
            linux: {
                primary: 0
            }
        }
    })));
    CoreNavigationCommands.CursorColumnSelectPageDown = registerEditorCommand(( new ColumnSelectDownCommand({
        isPaged: true,
        id: "cursorColumnSelectPageDown",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyMod$1.Alt | KeyCode.PageDown,
            linux: {
                primary: 0
            }
        }
    })));
    class CursorMoveImpl extends CoreEditorCommand {
        constructor() {
            super({
                id: "cursorMove",
                precondition: undefined,
                metadata: CursorMove.metadata
            });
        }
        runCoreEditorCommand(viewModel, args) {
            const parsed = CursorMove.parse(args);
            if (!parsed) {
                return;
            }
            this._runCursorMove(viewModel, args.source, parsed);
        }
        _runCursorMove(viewModel, source, args) {
            const effectiveSource = args.noHistory ? TextEditorSelectionSource.PROGRAMMATIC : source;
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(
                effectiveSource,
                CursorChangeReason.Explicit,
                CursorMoveImpl._move(viewModel, viewModel.getCursorStates(), args)
            );
            viewModel.revealAllCursors(effectiveSource, true);
        }
        static _move(viewModel, cursors, args) {
            const inSelectionMode = args.select;
            const value = args.value;
            switch (args.direction) {
            case CursorMove.Direction.Left:
            case CursorMove.Direction.Right:
            case CursorMove.Direction.Up:
            case CursorMove.Direction.Down:
            case CursorMove.Direction.PrevBlankLine:
            case CursorMove.Direction.NextBlankLine:
            case CursorMove.Direction.WrappedLineStart:
            case CursorMove.Direction.WrappedLineFirstNonWhitespaceCharacter:
            case CursorMove.Direction.WrappedLineColumnCenter:
            case CursorMove.Direction.WrappedLineEnd:
            case CursorMove.Direction.WrappedLineLastNonWhitespaceCharacter:
                return CursorMoveCommands.simpleMove(viewModel, cursors, args.direction, inSelectionMode, value, args.unit);
            case CursorMove.Direction.ViewPortTop:
            case CursorMove.Direction.ViewPortBottom:
            case CursorMove.Direction.ViewPortCenter:
            case CursorMove.Direction.ViewPortIfOutside:
                return CursorMoveCommands.viewportMove(viewModel, cursors, args.direction, inSelectionMode, value);
            default:
                return null;
            }
        }
    }
    CoreNavigationCommands.CursorMoveImpl = CursorMoveImpl;
    CoreNavigationCommands.CursorMove = registerEditorCommand(( new CursorMoveImpl()));
    let Constants;
    (function(Constants) {
        Constants[Constants["PAGE_SIZE_MARKER"] = -1] = "PAGE_SIZE_MARKER";
    })(Constants || (Constants = {}));
    class CursorMoveBasedCommand extends CoreEditorCommand {
        constructor(opts) {
            super(opts);
            this._staticArgs = opts.args;
        }
        runCoreEditorCommand(viewModel, dynamicArgs) {
            let args = this._staticArgs;
            if (this._staticArgs.value === Constants.PAGE_SIZE_MARKER) {
                args = {
                    direction: this._staticArgs.direction,
                    unit: this._staticArgs.unit,
                    select: this._staticArgs.select,
                    value: dynamicArgs.pageSize || viewModel.cursorConfig.pageSize
                };
            }
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(
                dynamicArgs.source,
                CursorChangeReason.Explicit,
                CursorMoveCommands.simpleMove(
                    viewModel,
                    viewModel.getCursorStates(),
                    args.direction,
                    args.select,
                    args.value,
                    args.unit
                )
            );
            viewModel.revealAllCursors(dynamicArgs.source, true);
        }
    }
    CoreNavigationCommands.CursorLeft = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Left,
            unit: CursorMove.Unit.None,
            select: false,
            value: 1
        },
        id: "cursorLeft",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyCode.LeftArrow,
            mac: {
                primary: KeyCode.LeftArrow,
                secondary: [KeyMod$1.WinCtrl | KeyCode.KeyB]
            }
        }
    })));
    CoreNavigationCommands.CursorLeftSelect = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Left,
            unit: CursorMove.Unit.None,
            select: true,
            value: 1
        },
        id: "cursorLeftSelect",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.Shift | KeyCode.LeftArrow
        }
    })));
    CoreNavigationCommands.CursorRight = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Right,
            unit: CursorMove.Unit.None,
            select: false,
            value: 1
        },
        id: "cursorRight",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyCode.RightArrow,
            mac: {
                primary: KeyCode.RightArrow,
                secondary: [KeyMod$1.WinCtrl | KeyCode.KeyF]
            }
        }
    })));
    CoreNavigationCommands.CursorRightSelect = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Right,
            unit: CursorMove.Unit.None,
            select: true,
            value: 1
        },
        id: "cursorRightSelect",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.Shift | KeyCode.RightArrow
        }
    })));
    CoreNavigationCommands.CursorUp = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Up,
            unit: CursorMove.Unit.WrappedLine,
            select: false,
            value: 1
        },
        id: "cursorUp",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyCode.UpArrow,
            mac: {
                primary: KeyCode.UpArrow,
                secondary: [KeyMod$1.WinCtrl | KeyCode.KeyP]
            }
        }
    })));
    CoreNavigationCommands.CursorUpSelect = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Up,
            unit: CursorMove.Unit.WrappedLine,
            select: true,
            value: 1
        },
        id: "cursorUpSelect",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.Shift | KeyCode.UpArrow,
            secondary: [KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyCode.UpArrow],
            mac: {
                primary: KeyMod$1.Shift | KeyCode.UpArrow
            },
            linux: {
                primary: KeyMod$1.Shift | KeyCode.UpArrow
            }
        }
    })));
    CoreNavigationCommands.CursorPageUp = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Up,
            unit: CursorMove.Unit.WrappedLine,
            select: false,
            value: Constants.PAGE_SIZE_MARKER
        },
        id: "cursorPageUp",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyCode.PageUp
        }
    })));
    CoreNavigationCommands.CursorPageUpSelect = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Up,
            unit: CursorMove.Unit.WrappedLine,
            select: true,
            value: Constants.PAGE_SIZE_MARKER
        },
        id: "cursorPageUpSelect",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.Shift | KeyCode.PageUp
        }
    })));
    CoreNavigationCommands.CursorDown = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Down,
            unit: CursorMove.Unit.WrappedLine,
            select: false,
            value: 1
        },
        id: "cursorDown",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyCode.DownArrow,
            mac: {
                primary: KeyCode.DownArrow,
                secondary: [KeyMod$1.WinCtrl | KeyCode.KeyN]
            }
        }
    })));
    CoreNavigationCommands.CursorDownSelect = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Down,
            unit: CursorMove.Unit.WrappedLine,
            select: true,
            value: 1
        },
        id: "cursorDownSelect",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.Shift | KeyCode.DownArrow,
            secondary: [KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyCode.DownArrow],
            mac: {
                primary: KeyMod$1.Shift | KeyCode.DownArrow
            },
            linux: {
                primary: KeyMod$1.Shift | KeyCode.DownArrow
            }
        }
    })));
    CoreNavigationCommands.CursorPageDown = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Down,
            unit: CursorMove.Unit.WrappedLine,
            select: false,
            value: Constants.PAGE_SIZE_MARKER
        },
        id: "cursorPageDown",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyCode.PageDown
        }
    })));
    CoreNavigationCommands.CursorPageDownSelect = registerEditorCommand(( new CursorMoveBasedCommand({
        args: {
            direction: CursorMove.Direction.Down,
            unit: CursorMove.Unit.WrappedLine,
            select: true,
            value: Constants.PAGE_SIZE_MARKER
        },
        id: "cursorPageDownSelect",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.Shift | KeyCode.PageDown
        }
    })));
    CoreNavigationCommands.CreateCursor = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "createCursor",
                precondition: undefined
            });
        }
        runCoreEditorCommand(viewModel, args) {
            if (!args.position) {
                return;
            }
            let newState;
            if (args.wholeLine) {
                newState = CursorMoveCommands.line(
                    viewModel,
                    viewModel.getPrimaryCursorState(),
                    false,
                    args.position,
                    args.viewPosition
                );
            } else {
                newState = CursorMoveCommands.moveTo(
                    viewModel,
                    viewModel.getPrimaryCursorState(),
                    false,
                    args.position,
                    args.viewPosition
                );
            }
            const states = viewModel.getCursorStates();
            if (states.length > 1) {
                const newModelPosition = (newState.modelState ? newState.modelState.position : null);
                const newViewPosition = (newState.viewState ? newState.viewState.position : null);
                for (let i = 0, len = states.length; i < len; i++) {
                    const state = states[i];
                    if (newModelPosition && !state.modelState.selection.containsPosition(newModelPosition)) {
                        continue;
                    }
                    if (newViewPosition && !state.viewState.selection.containsPosition(newViewPosition)) {
                        continue;
                    }
                    states.splice(i, 1);
                    viewModel.model.pushStackElement();
                    viewModel.setCursorStates(args.source, CursorChangeReason.Explicit, states);
                    return;
                }
            }
            states.push(newState);
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(args.source, CursorChangeReason.Explicit, states);
        }
    })());
    CoreNavigationCommands.LastCursorMoveToSelect = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "_lastCursorMoveToSelect",
                precondition: undefined
            });
        }
        runCoreEditorCommand(viewModel, args) {
            if (!args.position) {
                return;
            }
            const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
            const states = viewModel.getCursorStates();
            const newStates = states.slice(0);
            newStates[lastAddedCursorIndex] = CursorMoveCommands.moveTo(
                viewModel,
                states[lastAddedCursorIndex],
                true,
                args.position,
                args.viewPosition
            );
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(args.source, CursorChangeReason.Explicit, newStates);
        }
    })());
    class HomeCommand extends CoreEditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
        }
        runCoreEditorCommand(viewModel, args) {
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(
                args.source,
                CursorChangeReason.Explicit,
                CursorMoveCommands.moveToBeginningOfLine(viewModel, viewModel.getCursorStates(), this._inSelectionMode)
            );
            viewModel.revealAllCursors(args.source, true);
        }
    }
    CoreNavigationCommands.CursorHome = registerEditorCommand(( new HomeCommand({
        inSelectionMode: false,
        id: "cursorHome",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyCode.Home,
            mac: {
                primary: KeyCode.Home,
                secondary: [KeyMod$1.CtrlCmd | KeyCode.LeftArrow]
            }
        }
    })));
    CoreNavigationCommands.CursorHomeSelect = registerEditorCommand(( new HomeCommand({
        inSelectionMode: true,
        id: "cursorHomeSelect",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.Shift | KeyCode.Home,
            mac: {
                primary: KeyMod$1.Shift | KeyCode.Home,
                secondary: [KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyCode.LeftArrow]
            }
        }
    })));
    class LineStartCommand extends CoreEditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
        }
        runCoreEditorCommand(viewModel, args) {
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(
                args.source,
                CursorChangeReason.Explicit,
                this._exec(viewModel.getCursorStates())
            );
            viewModel.revealAllCursors(args.source, true);
        }
        _exec(cursors) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const lineNumber = cursor.modelState.position.lineNumber;
                result[i] = CursorState.fromModelState(cursor.modelState.move(this._inSelectionMode, lineNumber, 1, 0));
            }
            return result;
        }
    }
    CoreNavigationCommands.CursorLineStart = registerEditorCommand(( new LineStartCommand({
        inSelectionMode: false,
        id: "cursorLineStart",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: 0,
            mac: {
                primary: KeyMod$1.WinCtrl | KeyCode.KeyA
            }
        }
    })));
    CoreNavigationCommands.CursorLineStartSelect = registerEditorCommand(( new LineStartCommand({
        inSelectionMode: true,
        id: "cursorLineStartSelect",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: 0,
            mac: {
                primary: KeyMod$1.WinCtrl | KeyMod$1.Shift | KeyCode.KeyA
            }
        }
    })));
    class EndCommand extends CoreEditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
        }
        runCoreEditorCommand(viewModel, args) {
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(
                args.source,
                CursorChangeReason.Explicit,
                CursorMoveCommands.moveToEndOfLine(
                    viewModel,
                    viewModel.getCursorStates(),
                    this._inSelectionMode,
                    args.sticky || false
                )
            );
            viewModel.revealAllCursors(args.source, true);
        }
    }
    CoreNavigationCommands.CursorEnd = registerEditorCommand(( new EndCommand({
        inSelectionMode: false,
        id: "cursorEnd",
        precondition: undefined,
        kbOpts: {
            args: {
                sticky: false
            },
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyCode.End,
            mac: {
                primary: KeyCode.End,
                secondary: [KeyMod$1.CtrlCmd | KeyCode.RightArrow]
            }
        },
        metadata: {
            description: `Go to End`,
            args: [{
                name: "args",
                schema: {
                    type: "object",
                    properties: {
                        "sticky": {
                            description: ( localize(152, "Stick to the end even when going to longer lines")),
                            type: "boolean",
                            default: false
                        }
                    }
                }
            }]
        }
    })));
    CoreNavigationCommands.CursorEndSelect = registerEditorCommand(( new EndCommand({
        inSelectionMode: true,
        id: "cursorEndSelect",
        precondition: undefined,
        kbOpts: {
            args: {
                sticky: false
            },
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.Shift | KeyCode.End,
            mac: {
                primary: KeyMod$1.Shift | KeyCode.End,
                secondary: [KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyCode.RightArrow]
            }
        },
        metadata: {
            description: `Select to End`,
            args: [{
                name: "args",
                schema: {
                    type: "object",
                    properties: {
                        "sticky": {
                            description: ( localize(152, "Stick to the end even when going to longer lines")),
                            type: "boolean",
                            default: false
                        }
                    }
                }
            }]
        }
    })));
    class LineEndCommand extends CoreEditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
        }
        runCoreEditorCommand(viewModel, args) {
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(
                args.source,
                CursorChangeReason.Explicit,
                this._exec(viewModel, viewModel.getCursorStates())
            );
            viewModel.revealAllCursors(args.source, true);
        }
        _exec(viewModel, cursors) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const lineNumber = cursor.modelState.position.lineNumber;
                const maxColumn = viewModel.model.getLineMaxColumn(lineNumber);
                result[i] = CursorState.fromModelState(cursor.modelState.move(this._inSelectionMode, lineNumber, maxColumn, 0));
            }
            return result;
        }
    }
    CoreNavigationCommands.CursorLineEnd = registerEditorCommand(( new LineEndCommand({
        inSelectionMode: false,
        id: "cursorLineEnd",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: 0,
            mac: {
                primary: KeyMod$1.WinCtrl | KeyCode.KeyE
            }
        }
    })));
    CoreNavigationCommands.CursorLineEndSelect = registerEditorCommand(( new LineEndCommand({
        inSelectionMode: true,
        id: "cursorLineEndSelect",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: 0,
            mac: {
                primary: KeyMod$1.WinCtrl | KeyMod$1.Shift | KeyCode.KeyE
            }
        }
    })));
    class TopCommand extends CoreEditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
        }
        runCoreEditorCommand(viewModel, args) {
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(
                args.source,
                CursorChangeReason.Explicit,
                CursorMoveCommands.moveToBeginningOfBuffer(viewModel, viewModel.getCursorStates(), this._inSelectionMode)
            );
            viewModel.revealAllCursors(args.source, true);
        }
    }
    CoreNavigationCommands.CursorTop = registerEditorCommand(( new TopCommand({
        inSelectionMode: false,
        id: "cursorTop",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.CtrlCmd | KeyCode.Home,
            mac: {
                primary: KeyMod$1.CtrlCmd | KeyCode.UpArrow
            }
        }
    })));
    CoreNavigationCommands.CursorTopSelect = registerEditorCommand(( new TopCommand({
        inSelectionMode: true,
        id: "cursorTopSelect",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyCode.Home,
            mac: {
                primary: KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyCode.UpArrow
            }
        }
    })));
    class BottomCommand extends CoreEditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
        }
        runCoreEditorCommand(viewModel, args) {
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(
                args.source,
                CursorChangeReason.Explicit,
                CursorMoveCommands.moveToEndOfBuffer(viewModel, viewModel.getCursorStates(), this._inSelectionMode)
            );
            viewModel.revealAllCursors(args.source, true);
        }
    }
    CoreNavigationCommands.CursorBottom = registerEditorCommand(( new BottomCommand({
        inSelectionMode: false,
        id: "cursorBottom",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.CtrlCmd | KeyCode.End,
            mac: {
                primary: KeyMod$1.CtrlCmd | KeyCode.DownArrow
            }
        }
    })));
    CoreNavigationCommands.CursorBottomSelect = registerEditorCommand(( new BottomCommand({
        inSelectionMode: true,
        id: "cursorBottomSelect",
        precondition: undefined,
        kbOpts: {
            weight: CORE_WEIGHT,
            kbExpr: EditorContextKeys.textInputFocus,
            primary: KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyCode.End,
            mac: {
                primary: KeyMod$1.CtrlCmd | KeyMod$1.Shift | KeyCode.DownArrow
            }
        }
    })));
    class EditorScrollImpl extends CoreEditorCommand {
        constructor() {
            super({
                id: "editorScroll",
                precondition: undefined,
                metadata: EditorScroll_.metadata
            });
        }
        determineScrollMethod(args) {
            const horizontalUnits = [EditorScroll_.Unit.Column];
            const verticalUnits = [
                EditorScroll_.Unit.Line,
                EditorScroll_.Unit.WrappedLine,
                EditorScroll_.Unit.Page,
                EditorScroll_.Unit.HalfPage,
                EditorScroll_.Unit.Editor
            ];
            const horizontalDirections = [EditorScroll_.Direction.Left, EditorScroll_.Direction.Right];
            const verticalDirections = [EditorScroll_.Direction.Up, EditorScroll_.Direction.Down];
            if (horizontalUnits.includes(args.unit) && horizontalDirections.includes(args.direction)) {
                return this._runHorizontalEditorScroll.bind(this);
            }
            if (verticalUnits.includes(args.unit) && verticalDirections.includes(args.direction)) {
                return this._runVerticalEditorScroll.bind(this);
            }
            return null;
        }
        runCoreEditorCommand(viewModel, args) {
            const parsed = EditorScroll_.parse(args);
            if (!parsed) {
                return;
            }
            const runEditorScroll = this.determineScrollMethod(parsed);
            if (!runEditorScroll) {
                return;
            }
            runEditorScroll(viewModel, args.source, parsed);
        }
        _runVerticalEditorScroll(viewModel, source, args) {
            const desiredScrollTop = this._computeDesiredScrollTop(viewModel, args);
            if (args.revealCursor) {
                const desiredVisibleViewRange = viewModel.getCompletelyVisibleViewRangeAtScrollTop(desiredScrollTop);
                const paddedRange = viewModel.getViewRangeWithCursorPadding(desiredVisibleViewRange);
                viewModel.setCursorStates(source, CursorChangeReason.Explicit, [
                    CursorMoveCommands.findPositionInViewportIfOutside(viewModel, viewModel.getPrimaryCursorState(), paddedRange, args.select)
                ]);
            }
            viewModel.viewLayout.setScrollPosition({
                scrollTop: desiredScrollTop
            }, ScrollType.Smooth);
        }
        _computeDesiredScrollTop(viewModel, args) {
            if (args.unit === EditorScroll_.Unit.Line) {
                const futureViewport = viewModel.viewLayout.getFutureViewport();
                const visibleViewRange = viewModel.getCompletelyVisibleViewRangeAtScrollTop(futureViewport.top);
                const visibleModelRange = viewModel.coordinatesConverter.convertViewRangeToModelRange(visibleViewRange);
                let desiredTopModelLineNumber;
                if (args.direction === EditorScroll_.Direction.Up) {
                    desiredTopModelLineNumber = Math.max(1, visibleModelRange.startLineNumber - args.value);
                } else {
                    desiredTopModelLineNumber = Math.min(
                        viewModel.model.getLineCount(),
                        visibleModelRange.startLineNumber + args.value
                    );
                }
                const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(( new Position(desiredTopModelLineNumber, 1)));
                return viewModel.viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber);
            }
            if (args.unit === EditorScroll_.Unit.Editor) {
                let desiredTopModelLineNumber = 0;
                if (args.direction === EditorScroll_.Direction.Down) {
                    desiredTopModelLineNumber = viewModel.model.getLineCount() - viewModel.cursorConfig.pageSize;
                }
                return viewModel.viewLayout.getVerticalOffsetForLineNumber(desiredTopModelLineNumber);
            }
            let noOfLines;
            if (args.unit === EditorScroll_.Unit.Page) {
                noOfLines = viewModel.cursorConfig.pageSize * args.value;
            } else if (args.unit === EditorScroll_.Unit.HalfPage) {
                noOfLines = Math.round(viewModel.cursorConfig.pageSize / 2) * args.value;
            } else {
                noOfLines = args.value;
            }
            const deltaLines = (args.direction === EditorScroll_.Direction.Up ? -1 : 1) * noOfLines;
            return viewModel.viewLayout.getCurrentScrollTop() + deltaLines * viewModel.cursorConfig.lineHeight;
        }
        _runHorizontalEditorScroll(viewModel, source, args) {
            const desiredScrollLeft = this._computeDesiredScrollLeft(viewModel, args);
            viewModel.viewLayout.setScrollPosition({
                scrollLeft: desiredScrollLeft
            }, ScrollType.Smooth);
        }
        _computeDesiredScrollLeft(viewModel, args) {
            const deltaColumns = (args.direction === EditorScroll_.Direction.Left ? -1 : 1) * args.value;
            return viewModel.viewLayout.getCurrentScrollLeft() + deltaColumns * viewModel.cursorConfig.typicalHalfwidthCharacterWidth;
        }
    }
    CoreNavigationCommands.EditorScrollImpl = EditorScrollImpl;
    CoreNavigationCommands.EditorScroll = registerEditorCommand(( new EditorScrollImpl()));
    CoreNavigationCommands.ScrollLineUp = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "scrollLineUp",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus,
                    primary: KeyMod$1.CtrlCmd | KeyCode.UpArrow,
                    mac: {
                        primary: KeyMod$1.WinCtrl | KeyCode.PageUp
                    }
                }
            });
        }
        runCoreEditorCommand(viewModel, args) {
            CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                to: EditorScroll_.RawDirection.Up,
                by: EditorScroll_.RawUnit.WrappedLine,
                value: 1,
                revealCursor: false,
                select: false,
                source: args.source
            });
        }
    })());
    CoreNavigationCommands.ScrollPageUp = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "scrollPageUp",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus,
                    primary: KeyMod$1.CtrlCmd | KeyCode.PageUp,
                    win: {
                        primary: KeyMod$1.Alt | KeyCode.PageUp
                    },
                    linux: {
                        primary: KeyMod$1.Alt | KeyCode.PageUp
                    }
                }
            });
        }
        runCoreEditorCommand(viewModel, args) {
            CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                to: EditorScroll_.RawDirection.Up,
                by: EditorScroll_.RawUnit.Page,
                value: 1,
                revealCursor: false,
                select: false,
                source: args.source
            });
        }
    })());
    CoreNavigationCommands.ScrollEditorTop = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "scrollEditorTop",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus
                }
            });
        }
        runCoreEditorCommand(viewModel, args) {
            CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                to: EditorScroll_.RawDirection.Up,
                by: EditorScroll_.RawUnit.Editor,
                value: 1,
                revealCursor: false,
                select: false,
                source: args.source
            });
        }
    })());
    CoreNavigationCommands.ScrollLineDown = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "scrollLineDown",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus,
                    primary: KeyMod$1.CtrlCmd | KeyCode.DownArrow,
                    mac: {
                        primary: KeyMod$1.WinCtrl | KeyCode.PageDown
                    }
                }
            });
        }
        runCoreEditorCommand(viewModel, args) {
            CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                to: EditorScroll_.RawDirection.Down,
                by: EditorScroll_.RawUnit.WrappedLine,
                value: 1,
                revealCursor: false,
                select: false,
                source: args.source
            });
        }
    })());
    CoreNavigationCommands.ScrollPageDown = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "scrollPageDown",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus,
                    primary: KeyMod$1.CtrlCmd | KeyCode.PageDown,
                    win: {
                        primary: KeyMod$1.Alt | KeyCode.PageDown
                    },
                    linux: {
                        primary: KeyMod$1.Alt | KeyCode.PageDown
                    }
                }
            });
        }
        runCoreEditorCommand(viewModel, args) {
            CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                to: EditorScroll_.RawDirection.Down,
                by: EditorScroll_.RawUnit.Page,
                value: 1,
                revealCursor: false,
                select: false,
                source: args.source
            });
        }
    })());
    CoreNavigationCommands.ScrollEditorBottom = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "scrollEditorBottom",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus
                }
            });
        }
        runCoreEditorCommand(viewModel, args) {
            CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                to: EditorScroll_.RawDirection.Down,
                by: EditorScroll_.RawUnit.Editor,
                value: 1,
                revealCursor: false,
                select: false,
                source: args.source
            });
        }
    })());
    CoreNavigationCommands.ScrollLeft = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "scrollLeft",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus
                }
            });
        }
        runCoreEditorCommand(viewModel, args) {
            CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                to: EditorScroll_.RawDirection.Left,
                by: EditorScroll_.RawUnit.Column,
                value: 2,
                revealCursor: false,
                select: false,
                source: args.source
            });
        }
    })());
    CoreNavigationCommands.ScrollRight = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "scrollRight",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus
                }
            });
        }
        runCoreEditorCommand(viewModel, args) {
            CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                to: EditorScroll_.RawDirection.Right,
                by: EditorScroll_.RawUnit.Column,
                value: 2,
                revealCursor: false,
                select: false,
                source: args.source
            });
        }
    })());
    class WordCommand extends CoreEditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
        }
        runCoreEditorCommand(viewModel, args) {
            if (!args.position) {
                return;
            }
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(args.source, CursorChangeReason.Explicit, [CursorMoveCommands.word(
                viewModel,
                viewModel.getPrimaryCursorState(),
                this._inSelectionMode,
                args.position
            )]);
            if (args.revealType !== NavigationCommandRevealType.None) {
                viewModel.revealAllCursors(args.source, true, true);
            }
        }
    }
    CoreNavigationCommands.WordSelect = registerEditorCommand(( new WordCommand({
        inSelectionMode: false,
        id: "_wordSelect",
        precondition: undefined
    })));
    CoreNavigationCommands.WordSelectDrag = registerEditorCommand(( new WordCommand({
        inSelectionMode: true,
        id: "_wordSelectDrag",
        precondition: undefined
    })));
    CoreNavigationCommands.LastCursorWordSelect = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "lastCursorWordSelect",
                precondition: undefined
            });
        }
        runCoreEditorCommand(viewModel, args) {
            if (!args.position) {
                return;
            }
            const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
            const states = viewModel.getCursorStates();
            const newStates = states.slice(0);
            const lastAddedState = states[lastAddedCursorIndex];
            newStates[lastAddedCursorIndex] = CursorMoveCommands.word(
                viewModel,
                lastAddedState,
                lastAddedState.modelState.hasSelection(),
                args.position
            );
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(args.source, CursorChangeReason.Explicit, newStates);
        }
    })());
    class LineCommand extends CoreEditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
        }
        runCoreEditorCommand(viewModel, args) {
            if (!args.position) {
                return;
            }
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(args.source, CursorChangeReason.Explicit, [CursorMoveCommands.line(
                viewModel,
                viewModel.getPrimaryCursorState(),
                this._inSelectionMode,
                args.position,
                args.viewPosition
            )]);
            if (args.revealType !== NavigationCommandRevealType.None) {
                viewModel.revealAllCursors(args.source, false, true);
            }
        }
    }
    CoreNavigationCommands.LineSelect = registerEditorCommand(( new LineCommand({
        inSelectionMode: false,
        id: "_lineSelect",
        precondition: undefined
    })));
    CoreNavigationCommands.LineSelectDrag = registerEditorCommand(( new LineCommand({
        inSelectionMode: true,
        id: "_lineSelectDrag",
        precondition: undefined
    })));
    class LastCursorLineCommand extends CoreEditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
        }
        runCoreEditorCommand(viewModel, args) {
            if (!args.position) {
                return;
            }
            const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
            const states = viewModel.getCursorStates();
            const newStates = states.slice(0);
            newStates[lastAddedCursorIndex] = CursorMoveCommands.line(
                viewModel,
                states[lastAddedCursorIndex],
                this._inSelectionMode,
                args.position,
                args.viewPosition
            );
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(args.source, CursorChangeReason.Explicit, newStates);
        }
    }
    CoreNavigationCommands.LastCursorLineSelect = registerEditorCommand(( new LastCursorLineCommand({
        inSelectionMode: false,
        id: "lastCursorLineSelect",
        precondition: undefined
    })));
    CoreNavigationCommands.LastCursorLineSelectDrag = registerEditorCommand(( new LastCursorLineCommand({
        inSelectionMode: true,
        id: "lastCursorLineSelectDrag",
        precondition: undefined
    })));
    CoreNavigationCommands.CancelSelection = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "cancelSelection",
                precondition: EditorContextKeys.hasNonEmptySelection,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus,
                    primary: KeyCode.Escape,
                    secondary: [KeyMod$1.Shift | KeyCode.Escape]
                }
            });
        }
        runCoreEditorCommand(viewModel, args) {
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(args.source, CursorChangeReason.Explicit, [
                CursorMoveCommands.cancelSelection(viewModel, viewModel.getPrimaryCursorState())
            ]);
            viewModel.revealAllCursors(args.source, true);
        }
    })());
    CoreNavigationCommands.RemoveSecondaryCursors = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "removeSecondaryCursors",
                precondition: EditorContextKeys.hasMultipleSelections,
                kbOpts: {
                    weight: CORE_WEIGHT + 1,
                    kbExpr: EditorContextKeys.textInputFocus,
                    primary: KeyCode.Escape,
                    secondary: [KeyMod$1.Shift | KeyCode.Escape]
                }
            });
        }
        runCoreEditorCommand(viewModel, args) {
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(
                args.source,
                CursorChangeReason.Explicit,
                [viewModel.getPrimaryCursorState()]
            );
            viewModel.revealAllCursors(args.source, true);
            status(( localize(153, "Removed secondary cursors")));
        }
    })());
    CoreNavigationCommands.RevealLine = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "revealLine",
                precondition: undefined,
                metadata: RevealLine_.metadata
            });
        }
        runCoreEditorCommand(viewModel, args) {
            const revealLineArg = args;
            const lineNumberArg = revealLineArg.lineNumber || 0;
            let lineNumber = typeof lineNumberArg === "number" ? (lineNumberArg + 1) : (parseInt(lineNumberArg) + 1);
            if (lineNumber < 1) {
                lineNumber = 1;
            }
            const lineCount = viewModel.model.getLineCount();
            if (lineNumber > lineCount) {
                lineNumber = lineCount;
            }
            const range = ( new Range(lineNumber, 1, lineNumber, viewModel.model.getLineMaxColumn(lineNumber)));
            let revealAt = VerticalRevealType.Simple;
            if (revealLineArg.at) {
                switch (revealLineArg.at) {
                case RevealLine_.RawAtArgument.Top:
                    revealAt = VerticalRevealType.Top;
                    break;
                case RevealLine_.RawAtArgument.Center:
                    revealAt = VerticalRevealType.Center;
                    break;
                case RevealLine_.RawAtArgument.Bottom:
                    revealAt = VerticalRevealType.Bottom;
                    break;
                }
            }
            const viewRange = viewModel.coordinatesConverter.convertModelRangeToViewRange(range);
            viewModel.revealRange(args.source, false, viewRange, revealAt, ScrollType.Smooth);
        }
    })());
    CoreNavigationCommands.SelectAll = new (class extends EditorOrNativeTextInputCommand {
        constructor() {
            super(SelectAllCommand);
        }
        runDOMCommand(activeElement) {
            if (isFirefox) {
                activeElement.focus();
                activeElement.select();
            }
            activeElement.ownerDocument.execCommand("selectAll");
        }
        runEditorCommand(accessor, editor, args) {
            const viewModel = editor._getViewModel();
            if (!viewModel) {
                return;
            }
            this.runCoreEditorCommand(viewModel, args);
        }
        runCoreEditorCommand(viewModel, args) {
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(
                "keyboard",
                CursorChangeReason.Explicit,
                [CursorMoveCommands.selectAll(viewModel, viewModel.getPrimaryCursorState())]
            );
        }
    })();
    CoreNavigationCommands.SetSelection = registerEditorCommand(new (class extends CoreEditorCommand {
        constructor() {
            super({
                id: "setSelection",
                precondition: undefined
            });
        }
        runCoreEditorCommand(viewModel, args) {
            if (!args.selection) {
                return;
            }
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(
                args.source,
                CursorChangeReason.Explicit,
                [CursorState.fromModelSelection(args.selection)]
            );
        }
    })());
})(CoreNavigationCommands || (CoreNavigationCommands = {}));
const columnSelectionCondition = ( ContextKeyExpr.and(EditorContextKeys.textInputFocus, EditorContextKeys.columnSelection));
function registerColumnSelection(id, keybinding) {
    KeybindingsRegistry.registerKeybindingRule({
        id: id,
        primary: keybinding,
        when: columnSelectionCondition,
        weight: CORE_WEIGHT + 1
    });
}
registerColumnSelection(
    CoreNavigationCommands.CursorColumnSelectLeft.id,
    KeyMod$1.Shift | KeyCode.LeftArrow
);
registerColumnSelection(
    CoreNavigationCommands.CursorColumnSelectRight.id,
    KeyMod$1.Shift | KeyCode.RightArrow
);
registerColumnSelection(
    CoreNavigationCommands.CursorColumnSelectUp.id,
    KeyMod$1.Shift | KeyCode.UpArrow
);
registerColumnSelection(
    CoreNavigationCommands.CursorColumnSelectPageUp.id,
    KeyMod$1.Shift | KeyCode.PageUp
);
registerColumnSelection(
    CoreNavigationCommands.CursorColumnSelectDown.id,
    KeyMod$1.Shift | KeyCode.DownArrow
);
registerColumnSelection(
    CoreNavigationCommands.CursorColumnSelectPageDown.id,
    KeyMod$1.Shift | KeyCode.PageDown
);
function registerCommand(command) {
    command.register();
    return command;
}
var CoreEditingCommands;
(function(CoreEditingCommands) {
    class CoreEditingCommand extends EditorCommand {
        runEditorCommand(accessor, editor, args) {
            const viewModel = editor._getViewModel();
            if (!viewModel) {
                return;
            }
            this.runCoreEditingCommand(editor, viewModel, args || {});
        }
    }
    CoreEditingCommands.CoreEditingCommand = CoreEditingCommand;
    CoreEditingCommands.LineBreakInsert = registerEditorCommand(new (class extends CoreEditingCommand {
        constructor() {
            super({
                id: "lineBreakInsert",
                precondition: EditorContextKeys.writable,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: {
                        primary: KeyMod$1.WinCtrl | KeyCode.KeyO
                    }
                }
            });
        }
        runCoreEditingCommand(editor, viewModel, args) {
            editor.pushUndoStop();
            editor.executeCommands(
                this.id,
                EnterOperation.lineBreakInsert(viewModel.cursorConfig, viewModel.model, ( viewModel.getCursorStates().map(s => s.modelState.selection)))
            );
        }
    })());
    CoreEditingCommands.Outdent = registerEditorCommand(new (class extends CoreEditingCommand {
        constructor() {
            super({
                id: "outdent",
                precondition: EditorContextKeys.writable,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: ( ContextKeyExpr.and(EditorContextKeys.editorTextFocus, EditorContextKeys.tabDoesNotMoveFocus)),
                    primary: KeyMod$1.Shift | KeyCode.Tab
                }
            });
        }
        runCoreEditingCommand(editor, viewModel, args) {
            editor.pushUndoStop();
            editor.executeCommands(
                this.id,
                TypeOperations.outdent(viewModel.cursorConfig, viewModel.model, ( viewModel.getCursorStates().map(s => s.modelState.selection)))
            );
            editor.pushUndoStop();
        }
    })());
    CoreEditingCommands.Tab = registerEditorCommand(new (class extends CoreEditingCommand {
        constructor() {
            super({
                id: "tab",
                precondition: EditorContextKeys.writable,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: ( ContextKeyExpr.and(EditorContextKeys.editorTextFocus, EditorContextKeys.tabDoesNotMoveFocus)),
                    primary: KeyCode.Tab
                }
            });
        }
        runCoreEditingCommand(editor, viewModel, args) {
            editor.pushUndoStop();
            editor.executeCommands(
                this.id,
                TypeOperations.tab(viewModel.cursorConfig, viewModel.model, ( viewModel.getCursorStates().map(s => s.modelState.selection)))
            );
            editor.pushUndoStop();
        }
    })());
    CoreEditingCommands.DeleteLeft = registerEditorCommand(new (class extends CoreEditingCommand {
        constructor() {
            super({
                id: "deleteLeft",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus,
                    primary: KeyCode.Backspace,
                    secondary: [KeyMod$1.Shift | KeyCode.Backspace],
                    mac: {
                        primary: KeyCode.Backspace,
                        secondary: [
                            KeyMod$1.Shift | KeyCode.Backspace,
                            KeyMod$1.WinCtrl | KeyCode.KeyH,
                            KeyMod$1.WinCtrl | KeyCode.Backspace
                        ]
                    }
                }
            });
        }
        runCoreEditingCommand(editor, viewModel, args) {
            const [shouldPushStackElementBefore, commands] = DeleteOperations.deleteLeft(
                viewModel.getPrevEditOperationType(),
                viewModel.cursorConfig,
                viewModel.model,
                ( viewModel.getCursorStates().map(s => s.modelState.selection)),
                viewModel.getCursorAutoClosedCharacters()
            );
            if (shouldPushStackElementBefore) {
                editor.pushUndoStop();
            }
            editor.executeCommands(this.id, commands);
            viewModel.setPrevEditOperationType(EditOperationType.DeletingLeft);
        }
    })());
    CoreEditingCommands.DeleteRight = registerEditorCommand(new (class extends CoreEditingCommand {
        constructor() {
            super({
                id: "deleteRight",
                precondition: undefined,
                kbOpts: {
                    weight: CORE_WEIGHT,
                    kbExpr: EditorContextKeys.textInputFocus,
                    primary: KeyCode.Delete,
                    mac: {
                        primary: KeyCode.Delete,
                        secondary: [KeyMod$1.WinCtrl | KeyCode.KeyD, KeyMod$1.WinCtrl | KeyCode.Delete]
                    }
                }
            });
        }
        runCoreEditingCommand(editor, viewModel, args) {
            const [shouldPushStackElementBefore, commands] = DeleteOperations.deleteRight(
                viewModel.getPrevEditOperationType(),
                viewModel.cursorConfig,
                viewModel.model,
                ( viewModel.getCursorStates().map(s => s.modelState.selection))
            );
            if (shouldPushStackElementBefore) {
                editor.pushUndoStop();
            }
            editor.executeCommands(this.id, commands);
            viewModel.setPrevEditOperationType(EditOperationType.DeletingRight);
        }
    })());
    CoreEditingCommands.Undo = new (class extends EditorOrNativeTextInputCommand {
        constructor() {
            super(UndoCommand);
        }
        runDOMCommand(activeElement) {
            activeElement.ownerDocument.execCommand("undo");
        }
        runEditorCommand(accessor, editor, args) {
            if (!editor.hasModel() || editor.getOption(EditorOption.readOnly) === true) {
                return;
            }
            return editor.getModel().undo();
        }
    })();
    CoreEditingCommands.Redo = new (class extends EditorOrNativeTextInputCommand {
        constructor() {
            super(RedoCommand);
        }
        runDOMCommand(activeElement) {
            activeElement.ownerDocument.execCommand("redo");
        }
        runEditorCommand(accessor, editor, args) {
            if (!editor.hasModel() || editor.getOption(EditorOption.readOnly) === true) {
                return;
            }
            return editor.getModel().redo();
        }
    })();
})(CoreEditingCommands || (CoreEditingCommands = {}));
class EditorHandlerCommand extends Command {
    constructor(id, handlerId, metadata) {
        super({
            id: id,
            precondition: undefined,
            metadata
        });
        this._handlerId = handlerId;
    }
    runCommand(accessor, args) {
        const editor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
        if (!editor) {
            return;
        }
        editor.trigger("keyboard", this._handlerId, args);
    }
}
function registerOverwritableCommand(handlerId, metadata) {
    registerCommand(( new EditorHandlerCommand("default:" + handlerId, handlerId)));
    registerCommand(( new EditorHandlerCommand(handlerId, handlerId, metadata)));
}
registerOverwritableCommand(Handler.Type, {
    description: `Type`,
    args: [{
        name: "args",
        schema: {
            "type": "object",
            "required": ["text"],
            "properties": {
                "text": {
                    "type": "string"
                }
            }
        }
    }]
});
registerOverwritableCommand(Handler.ReplacePreviousChar);
registerOverwritableCommand(Handler.CompositionType);
registerOverwritableCommand(Handler.CompositionStart);
registerOverwritableCommand(Handler.CompositionEnd);
registerOverwritableCommand(Handler.Paste);
registerOverwritableCommand(Handler.Cut);

export { CoreEditingCommands, CoreEditorCommand, CoreNavigationCommands, EditorScroll_, NavigationCommandRevealType, RevealLine_ };
