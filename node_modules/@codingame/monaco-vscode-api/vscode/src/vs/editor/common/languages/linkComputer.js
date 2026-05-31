
import { CharCode } from '../../../base/common/charCode.js';
import { CharacterClassifier } from '../core/characterClassifier.js';

var State;
(function(State) {
    State[State["Invalid"] = 0] = "Invalid";
    State[State["Start"] = 1] = "Start";
    State[State["H"] = 2] = "H";
    State[State["HT"] = 3] = "HT";
    State[State["HTT"] = 4] = "HTT";
    State[State["HTTP"] = 5] = "HTTP";
    State[State["F"] = 6] = "F";
    State[State["FI"] = 7] = "FI";
    State[State["FIL"] = 8] = "FIL";
    State[State["BeforeColon"] = 9] = "BeforeColon";
    State[State["AfterColon"] = 10] = "AfterColon";
    State[State["AlmostThere"] = 11] = "AlmostThere";
    State[State["End"] = 12] = "End";
    State[State["Accept"] = 13] = "Accept";
    State[State["LastKnownState"] = 14] = "LastKnownState";
})(State || (State = {}));
class Uint8Matrix {
    constructor(rows, cols, defaultValue) {
        const data = ( new Uint8Array(rows * cols));
        for (let i = 0, len = rows * cols; i < len; i++) {
            data[i] = defaultValue;
        }
        this._data = data;
        this.rows = rows;
        this.cols = cols;
    }
    get(row, col) {
        return this._data[row * this.cols + col];
    }
    set(row, col, value) {
        this._data[row * this.cols + col] = value;
    }
}
class StateMachine {
    constructor(edges) {
        let maxCharCode = 0;
        let maxState = State.Invalid;
        for (let i = 0, len = edges.length; i < len; i++) {
            const [from, chCode, to] = edges[i];
            if (chCode > maxCharCode) {
                maxCharCode = chCode;
            }
            if (from > maxState) {
                maxState = from;
            }
            if (to > maxState) {
                maxState = to;
            }
        }
        maxCharCode++;
        maxState++;
        const states = ( new Uint8Matrix(maxState, maxCharCode, State.Invalid));
        for (let i = 0, len = edges.length; i < len; i++) {
            const [from, chCode, to] = edges[i];
            states.set(from, chCode, to);
        }
        this._states = states;
        this._maxCharCode = maxCharCode;
    }
    nextState(currentState, chCode) {
        if (chCode < 0 || chCode >= this._maxCharCode) {
            return State.Invalid;
        }
        return this._states.get(currentState, chCode);
    }
}
let _stateMachine = null;
function getStateMachine() {
    if (_stateMachine === null) {
        _stateMachine = ( new StateMachine([
            [State.Start, CharCode.h, State.H],
            [State.Start, CharCode.H, State.H],
            [State.Start, CharCode.f, State.F],
            [State.Start, CharCode.F, State.F],
            [State.H, CharCode.t, State.HT],
            [State.H, CharCode.T, State.HT],
            [State.HT, CharCode.t, State.HTT],
            [State.HT, CharCode.T, State.HTT],
            [State.HTT, CharCode.p, State.HTTP],
            [State.HTT, CharCode.P, State.HTTP],
            [State.HTTP, CharCode.s, State.BeforeColon],
            [State.HTTP, CharCode.S, State.BeforeColon],
            [State.HTTP, CharCode.Colon, State.AfterColon],
            [State.F, CharCode.i, State.FI],
            [State.F, CharCode.I, State.FI],
            [State.FI, CharCode.l, State.FIL],
            [State.FI, CharCode.L, State.FIL],
            [State.FIL, CharCode.e, State.BeforeColon],
            [State.FIL, CharCode.E, State.BeforeColon],
            [State.BeforeColon, CharCode.Colon, State.AfterColon],
            [State.AfterColon, CharCode.Slash, State.AlmostThere],
            [State.AlmostThere, CharCode.Slash, State.End]
        ]));
    }
    return _stateMachine;
}
var CharacterClass;
(function(CharacterClass) {
    CharacterClass[CharacterClass["None"] = 0] = "None";
    CharacterClass[CharacterClass["ForceTermination"] = 1] = "ForceTermination";
    CharacterClass[CharacterClass["CannotEndIn"] = 2] = "CannotEndIn";
})(CharacterClass || (CharacterClass = {}));
let _classifier = null;
function getClassifier() {
    if (_classifier === null) {
        _classifier = ( new CharacterClassifier(CharacterClass.None));
        const FORCE_TERMINATION_CHARACTERS = " \t<>'\"、。｡､，．：；‘〈「『〔（［｛｢｣｝］）〕』」〉’｀～…|";
        for (let i = 0; i < FORCE_TERMINATION_CHARACTERS.length; i++) {
            _classifier.set(
                FORCE_TERMINATION_CHARACTERS.charCodeAt(i),
                CharacterClass.ForceTermination
            );
        }
        const CANNOT_END_WITH_CHARACTERS = ".,;:";
        for (let i = 0; i < CANNOT_END_WITH_CHARACTERS.length; i++) {
            _classifier.set(CANNOT_END_WITH_CHARACTERS.charCodeAt(i), CharacterClass.CannotEndIn);
        }
    }
    return _classifier;
}
class LinkComputer {
    static _createLink(classifier, line, lineNumber, linkBeginIndex, linkEndIndex) {
        let lastIncludedCharIndex = linkEndIndex - 1;
        do {
            const chCode = line.charCodeAt(lastIncludedCharIndex);
            const chClass = classifier.get(chCode);
            if (chClass !== CharacterClass.CannotEndIn) {
                break;
            }
            lastIncludedCharIndex--;
        } while (lastIncludedCharIndex > linkBeginIndex);
        if (linkBeginIndex > 0) {
            const charCodeBeforeLink = line.charCodeAt(linkBeginIndex - 1);
            const lastCharCodeInLink = line.charCodeAt(lastIncludedCharIndex);
            if ((charCodeBeforeLink === CharCode.OpenParen && lastCharCodeInLink === CharCode.CloseParen) || (charCodeBeforeLink === CharCode.OpenSquareBracket && lastCharCodeInLink === CharCode.CloseSquareBracket) || (charCodeBeforeLink === CharCode.OpenCurlyBrace && lastCharCodeInLink === CharCode.CloseCurlyBrace)) {
                lastIncludedCharIndex--;
            }
        }
        return {
            range: {
                startLineNumber: lineNumber,
                startColumn: linkBeginIndex + 1,
                endLineNumber: lineNumber,
                endColumn: lastIncludedCharIndex + 2
            },
            url: line.substring(linkBeginIndex, lastIncludedCharIndex + 1)
        };
    }
    static computeLinks(model, stateMachine = getStateMachine()) {
        const classifier = getClassifier();
        const result = [];
        for (let i = 1, lineCount = model.getLineCount(); i <= lineCount; i++) {
            const line = model.getLineContent(i);
            const len = line.length;
            let j = 0;
            let linkBeginIndex = 0;
            let linkBeginChCode = 0;
            let state = State.Start;
            let hasOpenParens = false;
            let hasOpenSquareBracket = false;
            let inSquareBrackets = false;
            let hasOpenCurlyBracket = false;
            while (j < len) {
                let resetStateMachine = false;
                const chCode = line.charCodeAt(j);
                if (state === State.Accept) {
                    let chClass;
                    switch (chCode) {
                    case CharCode.OpenParen:
                        hasOpenParens = true;
                        chClass = CharacterClass.None;
                        break;
                    case CharCode.CloseParen:
                        chClass = (hasOpenParens ? CharacterClass.None : CharacterClass.ForceTermination);
                        break;
                    case CharCode.OpenSquareBracket:
                        inSquareBrackets = true;
                        hasOpenSquareBracket = true;
                        chClass = CharacterClass.None;
                        break;
                    case CharCode.CloseSquareBracket:
                        inSquareBrackets = false;
                        chClass = (hasOpenSquareBracket ? CharacterClass.None : CharacterClass.ForceTermination);
                        break;
                    case CharCode.OpenCurlyBrace:
                        hasOpenCurlyBracket = true;
                        chClass = CharacterClass.None;
                        break;
                    case CharCode.CloseCurlyBrace:
                        chClass = (hasOpenCurlyBracket ? CharacterClass.None : CharacterClass.ForceTermination);
                        break;
                    case CharCode.SingleQuote:
                    case CharCode.DoubleQuote:
                    case CharCode.BackTick:
                        if (linkBeginChCode === chCode) {
                            chClass = CharacterClass.ForceTermination;
                        } else if (linkBeginChCode === CharCode.SingleQuote || linkBeginChCode === CharCode.DoubleQuote || linkBeginChCode === CharCode.BackTick) {
                            chClass = CharacterClass.None;
                        } else {
                            chClass = CharacterClass.ForceTermination;
                        }
                        break;
                    case CharCode.Asterisk:
                        chClass = (linkBeginChCode === CharCode.Asterisk) ? CharacterClass.ForceTermination : CharacterClass.None;
                        break;
                    case CharCode.Space:
                        chClass = (inSquareBrackets ? CharacterClass.None : CharacterClass.ForceTermination);
                        break;
                    default:
                        chClass = classifier.get(chCode);
                    }
                    if (chClass === CharacterClass.ForceTermination) {
                        result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, j));
                        resetStateMachine = true;
                    }
                } else if (state === State.End) {
                    let chClass;
                    if (chCode === CharCode.OpenSquareBracket) {
                        hasOpenSquareBracket = true;
                        chClass = CharacterClass.None;
                    } else {
                        chClass = classifier.get(chCode);
                    }
                    if (chClass === CharacterClass.ForceTermination) {
                        resetStateMachine = true;
                    } else {
                        state = State.Accept;
                    }
                } else {
                    state = stateMachine.nextState(state, chCode);
                    if (state === State.Invalid) {
                        resetStateMachine = true;
                    }
                }
                if (resetStateMachine) {
                    state = State.Start;
                    hasOpenParens = false;
                    hasOpenSquareBracket = false;
                    hasOpenCurlyBracket = false;
                    linkBeginIndex = j + 1;
                    linkBeginChCode = chCode;
                }
                j++;
            }
            if (state === State.Accept) {
                result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, len));
            }
        }
        return result;
    }
}
function computeLinks(model) {
    if (!model || typeof model.getLineCount !== "function" || typeof model.getLineContent !== "function") {
        return [];
    }
    return LinkComputer.computeLinks(model);
}

export { LinkComputer, State, StateMachine, computeLinks };
