
import { Disposable } from '../../../common/lifecycle.js';

let baseHoverDelegate = {
    showInstantHover: () => undefined,
    showDelayedHover: () => undefined,
    setupDelayedHover: () => Disposable.None,
    setupDelayedHoverAtMouse: () => Disposable.None,
    hideHover: () => undefined,
    showAndFocusLastHover: () => undefined,
    setupManagedHover: () => ({
        dispose: () => undefined,
        show: () => undefined,
        hide: () => undefined,
        update: () => undefined,
    }),
    showManagedHover: () => undefined
};
function setBaseLayerHoverDelegate(hoverDelegate) {
    baseHoverDelegate = hoverDelegate;
}
function getBaseLayerHoverDelegate() {
    return baseHoverDelegate;
}

export { getBaseLayerHoverDelegate, setBaseLayerHoverDelegate };
