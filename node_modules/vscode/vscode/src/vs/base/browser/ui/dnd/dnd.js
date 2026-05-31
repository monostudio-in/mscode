
import { registerCss } from '../../../../../../../css.js';
import { $, getRootContainer } from '../../dom.js';
import * as dnd from './dnd.css';

registerCss(dnd);
function applyDragImage(event, container, label, extraClasses = []) {
    if (!event.dataTransfer) {
        return;
    }
    const dragImage = $(".monaco-drag-image");
    dragImage.textContent = label;
    dragImage.classList.add(...extraClasses);
    const getDragImageContainer = e => {
        while (e && !e.classList.contains("monaco-workbench")) {
            e = e.parentElement;
        }
        return e || getRootContainer(container);
    };
    const dragContainer = getDragImageContainer(container);
    dragContainer.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, -10, -10);
    setTimeout(() => dragImage.remove(), 0);
}

export { applyDragImage };
