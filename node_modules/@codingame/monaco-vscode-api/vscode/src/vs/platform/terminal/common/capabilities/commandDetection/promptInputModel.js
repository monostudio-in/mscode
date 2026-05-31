
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { throttle } from '../../../../../base/common/decorators.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { LogLevel } from '../../../../log/common/log.js';
import { ILogService } from '../../../../log/common/log.service.js';
import { PosixShellType } from '../../terminal.js';

var PromptInputState;
(function(PromptInputState) {
    PromptInputState[PromptInputState["Unknown"] = 0] = "Unknown";
    PromptInputState[PromptInputState["Input"] = 1] = "Input";
    PromptInputState[PromptInputState["Execute"] = 2] = "Execute";
})(PromptInputState || (PromptInputState = {}));
let PromptInputModel = class PromptInputModel extends Disposable {
    get state() {
        return this._state;
    }
    get value() {
        return this._value;
    }
    get prefix() {
        return this._value.substring(0, this._cursorIndex);
    }
    get suffix() {
        return this._value.substring(
            this._cursorIndex,
            this._ghostTextIndex === -1 ? undefined : this._ghostTextIndex
        );
    }
    get cursorIndex() {
        return this._cursorIndex;
    }
    get ghostTextIndex() {
        return this._ghostTextIndex;
    }
    constructor(
        _xterm,
        onCommandStart,
        onCommandStartChanged,
        onCommandExecuted,
        onCommandFinished,
        _logService
    ) {
        super();
        this._xterm = _xterm;
        this._logService = _logService;
        this._state = PromptInputState.Unknown;
        this._commandStartX = 0;
        this._lastUserInput = "";
        this._value = "";
        this._cursorIndex = 0;
        this._ghostTextIndex = -1;
        this._onDidStartInput = this._register(( new Emitter()));
        this.onDidStartInput = this._onDidStartInput.event;
        this._onDidChangeInput = this._register(( new Emitter()));
        this.onDidChangeInput = this._onDidChangeInput.event;
        this._onDidFinishInput = this._register(( new Emitter()));
        this.onDidFinishInput = this._onDidFinishInput.event;
        this._onDidInterrupt = this._register(( new Emitter()));
        this.onDidInterrupt = this._onDidInterrupt.event;
        this._register(
            Event.any(this._xterm.onCursorMove, this._xterm.onData, this._xterm.onWriteParsed)(() => this._sync())
        );
        this._register(this._xterm.onData(e => this._handleUserInput(e)));
        this._register(onCommandStart(e => this._handleCommandStart(e)));
        this._register(onCommandStartChanged(() => this._handleCommandStartChanged()));
        this._register(onCommandExecuted(() => this._handleCommandExecuted()));
        this._register(onCommandFinished(() => this._handleCommandFinished()));
        this._register(
            this.onDidStartInput(() => this._logCombinedStringIfTrace("PromptInputModel#onDidStartInput"))
        );
        this._register(
            this.onDidChangeInput(() => this._logCombinedStringIfTrace("PromptInputModel#onDidChangeInput"))
        );
        this._register(
            this.onDidFinishInput(() => this._logCombinedStringIfTrace("PromptInputModel#onDidFinishInput"))
        );
        this._register(
            this.onDidInterrupt(() => this._logCombinedStringIfTrace("PromptInputModel#onDidInterrupt"))
        );
    }
    _logCombinedStringIfTrace(message) {
        if (this._logService.getLevel() === LogLevel.Trace) {
            this._logService.trace(message, this.getCombinedString());
        }
    }
    setShellType(shellType) {
        this._shellType = shellType;
    }
    setContinuationPrompt(value) {
        this._continuationPrompt = value;
        this._sync();
    }
    setLastPromptLine(value) {
        this._lastPromptLine = value;
        this._sync();
    }
    setConfidentCommandLine(value) {
        if (this._value !== value) {
            this._value = value;
            this._cursorIndex = -1;
            this._ghostTextIndex = -1;
            this._onDidChangeInput.fire(this._createStateObject());
        }
    }
    getCombinedString(emptyStringWhenEmpty) {
        const value = this._value.replaceAll("\n", "⏎");
        if (this._cursorIndex === -1) {
            return value;
        }
        let result = `${value.substring(0, this.cursorIndex)}|`;
        if (this.ghostTextIndex !== -1) {
            result += `${value.substring(this.cursorIndex, this.ghostTextIndex)}[`;
            result += `${value.substring(this.ghostTextIndex)}]`;
        } else {
            result += value.substring(this.cursorIndex);
        }
        if (result === "|" && emptyStringWhenEmpty) {
            return "";
        }
        return result;
    }
    serialize() {
        return {
            modelState: this._createStateObject(),
            commandStartX: this._commandStartX,
            lastPromptLine: this._lastPromptLine,
            continuationPrompt: this._continuationPrompt,
            lastUserInput: this._lastUserInput
        };
    }
    deserialize(serialized) {
        this._value = serialized.modelState.value;
        this._cursorIndex = serialized.modelState.cursorIndex;
        this._ghostTextIndex = serialized.modelState.ghostTextIndex;
        this._commandStartX = serialized.commandStartX;
        this._lastPromptLine = serialized.lastPromptLine;
        this._continuationPrompt = serialized.continuationPrompt;
        this._lastUserInput = serialized.lastUserInput;
    }
    _handleCommandStart(command) {
        if (this._state === PromptInputState.Input) {
            return;
        }
        this._state = PromptInputState.Input;
        this._commandStartMarker = command.marker;
        this._commandStartX = this._xterm.buffer.active.cursorX;
        this._value = "";
        this._cursorIndex = 0;
        this._onDidStartInput.fire(this._createStateObject());
        this._onDidChangeInput.fire(this._createStateObject());
        if (this._lastPromptLine) {
            if (this._commandStartX !== this._lastPromptLine.length) {
                const line = this._xterm.buffer.active.getLine(this._commandStartMarker.line);
                if (line?.translateToString(true).startsWith(this._lastPromptLine)) {
                    this._commandStartX = this._lastPromptLine.length;
                    this._sync();
                }
            }
        }
    }
    _handleCommandStartChanged() {
        if (this._state !== PromptInputState.Input) {
            return;
        }
        this._commandStartX = this._xterm.buffer.active.cursorX;
        this._onDidChangeInput.fire(this._createStateObject());
        this._sync();
    }
    _handleCommandExecuted() {
        if (this._state === PromptInputState.Execute) {
            return;
        }
        this._cursorIndex = -1;
        if (this._ghostTextIndex !== -1) {
            this._value = this._value.substring(0, this._ghostTextIndex);
            this._ghostTextIndex = -1;
        }
        const event = this._createStateObject();
        if (this._lastUserInput === "\u0003") {
            this._lastUserInput = "";
            this._onDidInterrupt.fire(event);
        }
        this._state = PromptInputState.Execute;
        this._onDidFinishInput.fire(event);
        this._onDidChangeInput.fire(event);
    }
    _handleCommandFinished() {
        this._value = "";
        this._onDidChangeInput.fire(this._createStateObject());
    }
    _sync() {
        try {
            this._doSync();
        } catch (e) {
            this._logService.error("Error while syncing prompt input model", e);
        }
    }
    _doSync() {
        if (this._state !== PromptInputState.Input) {
            return;
        }
        let commandStartY = this._commandStartMarker?.line;
        if (commandStartY === undefined) {
            return;
        }
        const buffer = this._xterm.buffer.active;
        let line = buffer.getLine(commandStartY);
        const absoluteCursorY = buffer.baseY + buffer.cursorY;
        let cursorIndex;
        let commandLine = line?.translateToString(true, this._commandStartX);
        if (this._shellType === PosixShellType.Fish && (!line || !commandLine)) {
            commandStartY += 1;
            line = buffer.getLine(commandStartY);
            if (line) {
                commandLine = line.translateToString(true);
                cursorIndex = absoluteCursorY === commandStartY ? buffer.cursorX : commandLine?.trimEnd().length;
            }
        }
        if (line === undefined || commandLine === undefined) {
            this._logService.trace(`PromptInputModel#_sync: no line`);
            return;
        }
        let value = commandLine;
        let ghostTextIndex = -1;
        if (cursorIndex === undefined) {
            if (absoluteCursorY === commandStartY) {
                cursorIndex = Math.min(
                    this._getRelativeCursorIndex(this._commandStartX, buffer, line),
                    commandLine.length
                );
            } else {
                cursorIndex = commandLine.trimEnd().length;
            }
        }
        for (let y = commandStartY + 1; y <= absoluteCursorY; y++) {
            const nextLine = buffer.getLine(y);
            const lineText = nextLine?.translateToString(true);
            if (lineText && nextLine) {
                if (nextLine.isWrapped || (absoluteCursorY === y && this._continuationPrompt && !this._lineContainsContinuationPrompt(lineText))) {
                    value += `${lineText}`;
                    const relativeCursorIndex = this._getRelativeCursorIndex(0, buffer, nextLine);
                    if (absoluteCursorY === y) {
                        cursorIndex += relativeCursorIndex;
                    } else {
                        cursorIndex += lineText.length;
                    }
                } else if (this._shellType === PosixShellType.Fish) {
                    if (value.endsWith("\\")) {
                        value = value.substring(0, value.length - 1);
                        value += `${lineText.trim()}`;
                        cursorIndex += lineText.trim().length - 1;
                    } else {
                        if (/^ {6,}/.test(lineText)) {
                            value += `\n${lineText.trim()}`;
                            cursorIndex += lineText.trim().length + 1;
                        } else {
                            value += lineText;
                            cursorIndex += lineText.length;
                        }
                    }
                }
                else if (this._continuationPrompt === undefined || this._lineContainsContinuationPrompt(lineText)) {
                    const trimmedLineText = this._trimContinuationPrompt(lineText);
                    value += `\n${trimmedLineText}`;
                    if (absoluteCursorY === y) {
                        const continuationCellWidth = this._getContinuationPromptCellWidth(nextLine, lineText);
                        const relativeCursorIndex = this._getRelativeCursorIndex(continuationCellWidth, buffer, nextLine);
                        cursorIndex += relativeCursorIndex + 1;
                    } else {
                        cursorIndex += trimmedLineText.length + 1;
                    }
                }
            }
        }
        for (let y = absoluteCursorY + 1; y < buffer.baseY + this._xterm.rows; y++) {
            const belowCursorLine = buffer.getLine(y);
            const lineText = belowCursorLine?.translateToString(true);
            if (lineText && belowCursorLine) {
                if (this._shellType === PosixShellType.Fish) {
                    value += `${lineText}`;
                } else if (this._continuationPrompt === undefined || this._lineContainsContinuationPrompt(lineText)) {
                    value += `\n${this._trimContinuationPrompt(lineText)}`;
                } else {
                    value += lineText;
                }
            } else {
                break;
            }
        }
        if (this._logService.getLevel() === LogLevel.Trace) {
            this._logService.trace(`PromptInputModel#_sync: ${this.getCombinedString()}`);
        }
        {
            let trailingWhitespace = this._value.length - this._value.trimEnd().length;
            if (this._lastUserInput === "") {
                this._lastUserInput = "";
                if (cursorIndex === this._cursorIndex - 1) {
                    if (this._value.trimEnd().length > value.trimEnd().length && value.trimEnd().length <= cursorIndex) {
                        trailingWhitespace = Math.max((this._value.length - 1) - value.trimEnd().length, 0);
                    }
                    else {
                        trailingWhitespace = Math.max(trailingWhitespace - 1, 0);
                    }
                }
            }
            if (this._lastUserInput === "\u001b[3~") {
                this._lastUserInput = "";
                if (cursorIndex === this._cursorIndex) {
                    trailingWhitespace = Math.max(trailingWhitespace - 1, 0);
                }
            }
            const valueLines = value.split("\n");
            const isMultiLine = valueLines.length > 1;
            const valueEndTrimmed = value.trimEnd();
            if (!isMultiLine) {
                if (valueEndTrimmed.length < value.length) {
                    if (this._lastUserInput === " ") {
                        this._lastUserInput = "";
                        if (cursorIndex > valueEndTrimmed.length && cursorIndex > this._cursorIndex) {
                            trailingWhitespace++;
                        }
                    }
                    trailingWhitespace = Math.max(cursorIndex - valueEndTrimmed.length, trailingWhitespace, 0);
                }
                const charBeforeCursor = cursorIndex === 0 ? "" : value[cursorIndex - 1];
                if (trailingWhitespace > 0 && cursorIndex === this._cursorIndex + 1 && this._lastUserInput !== "" && charBeforeCursor !== " ") {
                    trailingWhitespace = this._value.length - this._cursorIndex;
                }
            }
            if (isMultiLine) {
                valueLines[valueLines.length - 1] = valueLines.at(-1)?.trimEnd() ?? "";
                const continuationOffset = (valueLines.length - 1) * (this._continuationPrompt?.length ?? 0);
                trailingWhitespace = Math.max(0, cursorIndex - value.length - continuationOffset);
            }
            value = ( valueLines.map(e => e.trimEnd())).join("\n") + " ".repeat(trailingWhitespace);
        }
        ghostTextIndex = this._scanForGhostText(buffer, line, cursorIndex);
        if (this._value !== value || this._cursorIndex !== cursorIndex || this._ghostTextIndex !== ghostTextIndex) {
            this._value = value;
            this._cursorIndex = cursorIndex;
            this._ghostTextIndex = ghostTextIndex;
            this._onDidChangeInput.fire(this._createStateObject());
        }
    }
    _handleUserInput(e) {
        this._lastUserInput = e;
    }
    _scanForGhostText(buffer, line, cursorIndex) {
        if (!this.value.trim().length) {
            return -1;
        }
        let ghostTextIndex = -1;
        let proceedWithGhostTextCheck = false;
        let x = buffer.cursorX;
        while (x > 0) {
            const cell = line.getCell(--x);
            if (!cell) {
                break;
            }
            if (cell.getChars().trim().length > 0) {
                proceedWithGhostTextCheck = !this._isCellStyledLikeGhostText(cell);
                break;
            }
        }
        if (proceedWithGhostTextCheck) {
            let potentialGhostIndexOffset = 0;
            let x = buffer.cursorX;
            while (x < line.length) {
                const cell = line.getCell(x++);
                if (!cell || cell.getCode() === 0) {
                    break;
                }
                if (this._isCellStyledLikeGhostText(cell)) {
                    ghostTextIndex = cursorIndex + potentialGhostIndexOffset;
                    break;
                }
                potentialGhostIndexOffset += cell.getChars().length;
            }
        }
        if (ghostTextIndex === -1) {
            ghostTextIndex = this._scanForGhostTextAdvanced(buffer, line, cursorIndex);
        }
        if (ghostTextIndex > -1 && this.value.substring(ghostTextIndex).endsWith(" ")) {
            this._value = this.value.trim();
            if (!this.value.substring(ghostTextIndex)) {
                ghostTextIndex = -1;
            }
        }
        return ghostTextIndex;
    }
    _scanForGhostTextAdvanced(buffer, line, cursorIndex) {
        let ghostTextIndex = -1;
        let currentPos = buffer.cursorX;
        const styleMap = ( new Map());
        let lastNonWhitespaceCell = line.getCell(currentPos);
        let nextCell = lastNonWhitespaceCell;
        while (nextCell && currentPos < line.length) {
            const styleKey = this._getCellStyleAsString(nextCell);
            styleMap.set(styleKey, [...(styleMap.get(styleKey) ?? []), currentPos]);
            nextCell = line.getCell(++currentPos);
            if (nextCell?.getChars().trim().length) {
                lastNonWhitespaceCell = nextCell;
            }
        }
        if (!lastNonWhitespaceCell?.getChars().trim().length || this._cellStylesMatch(line.getCell(this._commandStartX), lastNonWhitespaceCell)) {
            return -1;
        }
        const positionsWithGhostStyle = styleMap.get(this._getCellStyleAsString(lastNonWhitespaceCell));
        if (positionsWithGhostStyle) {
            if (positionsWithGhostStyle[0] > buffer.cursorX + 1 && this._isPositionRightPrompt(line, positionsWithGhostStyle[0])) {
                return -1;
            }
            for (let i = 1; i < positionsWithGhostStyle.length; i++) {
                if (positionsWithGhostStyle[i] !== positionsWithGhostStyle[i - 1] + 1) {
                    return -1;
                }
            }
            if (buffer.baseY + buffer.cursorY === this._commandStartMarker?.line) {
                ghostTextIndex = positionsWithGhostStyle[0] - this._commandStartX;
            } else {
                ghostTextIndex = positionsWithGhostStyle[0];
            }
        }
        if (ghostTextIndex !== -1) {
            for (let checkPos = buffer.cursorX; checkPos >= this._commandStartX; checkPos--) {
                const checkCell = line.getCell(checkPos);
                if (!checkCell?.getChars.length) {
                    continue;
                }
                if (checkCell && checkCell.getCode() !== 0 && this._cellStylesMatch(lastNonWhitespaceCell, checkCell)) {
                    return -1;
                }
            }
        }
        return ghostTextIndex >= cursorIndex ? ghostTextIndex : -1;
    }
    _isPositionRightPrompt(line, position) {
        let count = 0;
        for (let i = position - 1; i >= this._commandStartX; i--) {
            const cell = line.getCell(i);
            if (!cell || cell.getChars().trim().length === 0) {
                count++;
                if (count >= 5) {
                    return true;
                }
            } else {
                count = 0;
            }
        }
        return false;
    }
    _getCellStyleAsString(cell) {
        return `${cell.getFgColor()}${cell.getBgColor()}${cell.isBold()}${cell.isItalic()}${cell.isDim()}${cell.isUnderline()}${cell.isBlink()}${cell.isInverse()}${cell.isInvisible()}${cell.isStrikethrough()}${cell.isOverline()}${cell.getFgColorMode()}${cell.getBgColorMode()}`;
    }
    _cellStylesMatch(a, b) {
        if (!a || !b) {
            return false;
        }
        return a.getFgColor() === b.getFgColor() && a.getBgColor() === b.getBgColor() && a.isBold() === b.isBold() && a.isItalic() === b.isItalic() && a.isDim() === b.isDim() && a.isUnderline() === b.isUnderline() && a.isBlink() === b.isBlink() && a.isInverse() === b.isInverse() && a.isInvisible() === b.isInvisible() && a.isStrikethrough() === b.isStrikethrough() && a.isOverline() === b.isOverline() && a?.getBgColorMode() === b?.getBgColorMode() && a?.getFgColorMode() === b?.getFgColorMode();
    }
    _trimContinuationPrompt(lineText) {
        if (this._lineContainsContinuationPrompt(lineText)) {
            lineText = lineText.substring(this._continuationPrompt.length);
        }
        return lineText;
    }
    _lineContainsContinuationPrompt(lineText) {
        return !!(this._continuationPrompt && lineText.startsWith(this._continuationPrompt.trimEnd()));
    }
    _getContinuationPromptCellWidth(line, lineText) {
        if (!this._continuationPrompt || !lineText.startsWith(this._continuationPrompt.trimEnd())) {
            return 0;
        }
        let buffer = "";
        let x = 0;
        let cell;
        while (buffer !== this._continuationPrompt) {
            cell = line.getCell(x++);
            if (!cell) {
                break;
            }
            buffer += cell.getChars();
        }
        return x;
    }
    _getRelativeCursorIndex(startCellX, buffer, line) {
        return line?.translateToString(false, startCellX, buffer.cursorX).length ?? 0;
    }
    _isCellStyledLikeGhostText(cell) {
        return !!(cell.isItalic() || cell.isDim());
    }
    _createStateObject() {
        return ( Object.freeze({
            value: this._value,
            prefix: this.prefix,
            suffix: this.suffix,
            cursorIndex: this._cursorIndex,
            ghostTextIndex: this._ghostTextIndex
        }));
    }
};
PromptInputModel.__decorator = ( __decorate([throttle(0)], PromptInputModel.prototype, "_sync", null));
PromptInputModel = ( __decorate([( __param(5, ILogService))], PromptInputModel));

export { PromptInputModel, PromptInputState };
