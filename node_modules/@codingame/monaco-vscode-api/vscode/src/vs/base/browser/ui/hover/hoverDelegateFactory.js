
import { Lazy } from '../../../common/lazy.js';

const nullHoverDelegateFactory = () => ({
    get delay() {
        return -1;
    },
    dispose: () => {},
    showHover: () => {
        return undefined;
    }
});
let hoverDelegateFactory = nullHoverDelegateFactory;
const defaultHoverDelegateMouse = ( new Lazy(() => hoverDelegateFactory("mouse", false)));
const defaultHoverDelegateElement = ( new Lazy(() => hoverDelegateFactory("element", false)));
function setHoverDelegateFactory(hoverDelegateProvider) {
    hoverDelegateFactory = hoverDelegateProvider;
}
function getDefaultHoverDelegate(placement) {
    if (placement === "element") {
        return defaultHoverDelegateElement.value;
    }
    return defaultHoverDelegateMouse.value;
}
function createInstantHoverDelegate() {
    return hoverDelegateFactory("element", true);
}

export { createInstantHoverDelegate, getDefaultHoverDelegate, setHoverDelegateFactory };
