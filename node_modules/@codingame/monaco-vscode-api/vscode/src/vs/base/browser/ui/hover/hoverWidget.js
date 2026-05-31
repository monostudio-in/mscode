
import { registerCss } from '../../../../../../../css.js';
import { $ as $$1, createElement, append, addDisposableListener, EventType } from '../../dom.js';
import { StandardKeyboardEvent } from '../../keyboardEvent.js';
import { DomScrollableElement } from '../scrollbar/scrollableElement.js';
import { KeyCode } from '../../../common/keyCodes.js';
import { Disposable } from '../../../common/lifecycle.js';
import * as hoverWidget from './hoverWidget.css';
import { localize } from '../../../../nls.js';

registerCss(hoverWidget);
const $ = $$1;
var HoverPosition;
(function(HoverPosition) {
    HoverPosition[HoverPosition["LEFT"] = 0] = "LEFT";
    HoverPosition[HoverPosition["RIGHT"] = 1] = "RIGHT";
    HoverPosition[HoverPosition["BELOW"] = 2] = "BELOW";
    HoverPosition[HoverPosition["ABOVE"] = 3] = "ABOVE";
})(HoverPosition || (HoverPosition = {}));
class HoverWidget extends Disposable {
    constructor(fadeIn) {
        super();
        this.containerDomNode = createElement("div");
        this.containerDomNode.className = "monaco-hover";
        this.containerDomNode.classList.toggle("fade-in", !!fadeIn);
        this.containerDomNode.tabIndex = 0;
        this.containerDomNode.setAttribute("role", "tooltip");
        this.contentsDomNode = createElement("div");
        this.contentsDomNode.className = "monaco-hover-content";
        this.scrollbar = this._register(( new DomScrollableElement(this.contentsDomNode, {
            consumeMouseWheelIfScrollbarIsNeeded: true
        })));
        this.containerDomNode.appendChild(this.scrollbar.getDomNode());
    }
    onContentsChanged() {
        this.scrollbar.scanDomNode();
    }
}
class HoverAction extends Disposable {
    static render(parent, actionOptions, keybindingLabel) {
        return ( new HoverAction(parent, actionOptions, keybindingLabel));
    }
    constructor(parent, actionOptions, keybindingLabel) {
        super();
        this.actionLabel = actionOptions.label;
        this.actionKeybindingLabel = keybindingLabel;
        this.actionContainer = append(parent, $("div.action-container"));
        this.actionContainer.setAttribute("tabindex", "0");
        this.action = append(this.actionContainer, $("a.action"));
        this.action.setAttribute("role", "button");
        if (actionOptions.iconClass) {
            const iconElement = append(this.action, $(`span.icon`));
            iconElement.classList.add(...actionOptions.iconClass.split(" "));
        }
        this.actionRenderedLabel = keybindingLabel ? `${actionOptions.label} (${keybindingLabel})` : actionOptions.label;
        const label = append(this.action, $("span"));
        label.textContent = this.actionRenderedLabel;
        this._store.add(( new ClickAction(this.actionContainer, actionOptions.run)));
        this._store.add(( new KeyDownAction(this.actionContainer, actionOptions.run, [KeyCode.Enter, KeyCode.Space])));
        this.setEnabled(true);
    }
    setEnabled(enabled) {
        if (enabled) {
            this.actionContainer.classList.remove("disabled");
            this.actionContainer.removeAttribute("aria-disabled");
        } else {
            this.actionContainer.classList.add("disabled");
            this.actionContainer.setAttribute("aria-disabled", "true");
        }
    }
}
function getHoverAccessibleViewHint(shouldHaveHint, keybinding) {
    return shouldHaveHint && keybinding ? ( localize(16, "Inspect this in the accessible view with {0}.", keybinding)) : shouldHaveHint ? ( localize(
        17,
        "Inspect this in the accessible view via the command Open Accessible View which is currently not triggerable via keybinding."
    )) : "";
}
class ClickAction extends Disposable {
    constructor(container, run) {
        super();
        this._register(addDisposableListener(container, EventType.CLICK, e => {
            e.stopPropagation();
            e.preventDefault();
            run(container);
        }));
    }
}
class KeyDownAction extends Disposable {
    constructor(container, run, keyCodes) {
        super();
        this._register(addDisposableListener(container, EventType.KEY_DOWN, e => {
            const event = ( new StandardKeyboardEvent(e));
            if (( keyCodes.some(keyCode => event.equals(keyCode)))) {
                e.stopPropagation();
                e.preventDefault();
                run(container);
            }
        }));
    }
}

export { ClickAction, HoverAction, HoverPosition, HoverWidget, KeyDownAction, getHoverAccessibleViewHint };
