
import { registerCss } from '../../../../../../../css.js';
import { createElement, clearNode } from '../../dom.js';
import * as aria from './aria.css';

registerCss(aria);
const MAX_MESSAGE_LENGTH = 20000;
let ariaContainer;
let alertContainer;
let alertContainer2;
let statusContainer;
let statusContainer2;
function setARIAContainer(parent) {
    ariaContainer = createElement("div");
    ariaContainer.className = "monaco-aria-container";
    const createAlertContainer = () => {
        const element = createElement("div");
        element.className = "monaco-alert";
        element.setAttribute("role", "alert");
        element.setAttribute("aria-atomic", "true");
        ariaContainer.appendChild(element);
        return element;
    };
    alertContainer = createAlertContainer();
    alertContainer2 = createAlertContainer();
    const createStatusContainer = () => {
        const element = createElement("div");
        element.className = "monaco-status";
        element.setAttribute("aria-live", "polite");
        element.setAttribute("aria-atomic", "true");
        ariaContainer.appendChild(element);
        return element;
    };
    statusContainer = createStatusContainer();
    statusContainer2 = createStatusContainer();
    parent.appendChild(ariaContainer);
}
function alert(msg) {
    if (!ariaContainer) {
        return;
    }
    if (alertContainer.textContent !== msg) {
        clearNode(alertContainer2);
        insertMessage(alertContainer, msg);
    } else {
        clearNode(alertContainer);
        insertMessage(alertContainer2, msg);
    }
}
function status(msg) {
    if (!ariaContainer) {
        return;
    }
    if (statusContainer.textContent !== msg) {
        clearNode(statusContainer2);
        insertMessage(statusContainer, msg);
    } else {
        clearNode(statusContainer);
        insertMessage(statusContainer2, msg);
    }
}
function insertMessage(target, msg) {
    clearNode(target);
    if (msg.length > MAX_MESSAGE_LENGTH) {
        msg = msg.substr(0, MAX_MESSAGE_LENGTH);
    }
    target.textContent = msg;
    target.style.visibility = "hidden";
    target.style.visibility = "visible";
}

export { alert, setARIAContainer, status };
