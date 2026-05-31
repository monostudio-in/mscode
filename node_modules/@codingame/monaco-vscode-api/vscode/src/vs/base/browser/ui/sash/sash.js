
import { registerCss } from '../../../../../../../css.js';
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { getWindow, append, $, addDisposableListener, EventHelper, isHTMLElement } from '../../dom.js';
import { createStyleSheet } from '../../domStylesheets.js';
import { DomEmitter } from '../../event.js';
import { EventType, Gesture } from '../../touch.js';
import { Delayer } from '../../../common/async.js';
import { memoize } from '../../../common/decorators.js';
import { Emitter } from '../../../common/event.js';
import { DisposableStore, Disposable, toDisposable } from '../../../common/lifecycle.js';
import { isMacintosh } from '../../../common/platform.js';
import * as sash from './sash.css';

registerCss(sash);
const DEBUG = false;
var OrthogonalEdge;
(function(OrthogonalEdge) {
    OrthogonalEdge["North"] = "north";
    OrthogonalEdge["South"] = "south";
    OrthogonalEdge["East"] = "east";
    OrthogonalEdge["West"] = "west";
})(OrthogonalEdge || (OrthogonalEdge = {}));
var Orientation;
(function(Orientation) {
    Orientation[Orientation["VERTICAL"] = 0] = "VERTICAL";
    Orientation[Orientation["HORIZONTAL"] = 1] = "HORIZONTAL";
})(Orientation || (Orientation = {}));
var SashState;
(function(SashState) {
    SashState[SashState["Disabled"] = 0] = "Disabled";
    SashState[SashState["AtMinimum"] = 1] = "AtMinimum";
    SashState[SashState["AtMaximum"] = 2] = "AtMaximum";
    SashState[SashState["Enabled"] = 3] = "Enabled";
})(SashState || (SashState = {}));
let globalSize = 4;
const onDidChangeGlobalSize = ( new Emitter());
function setGlobalSashSize(size) {
    globalSize = size;
    onDidChangeGlobalSize.fire(size);
}
let globalHoverDelay = 300;
const onDidChangeHoverDelay = ( new Emitter());
function setGlobalHoverDelay(size) {
    globalHoverDelay = size;
    onDidChangeHoverDelay.fire(size);
}
class MouseEventFactory {
    constructor(el) {
        this.el = el;
        this.disposables = ( new DisposableStore());
    }
    get onPointerMove() {
        return this.disposables.add(( new DomEmitter(getWindow(this.el), "mousemove"))).event;
    }
    get onPointerUp() {
        return this.disposables.add(( new DomEmitter(getWindow(this.el), "mouseup"))).event;
    }
    dispose() {
        this.disposables.dispose();
    }
}
MouseEventFactory.__decorator = ( __decorate([memoize], MouseEventFactory.prototype, "onPointerMove", null));
MouseEventFactory.__decorator = ( __decorate([memoize], MouseEventFactory.prototype, "onPointerUp", null));
class GestureEventFactory {
    get onPointerMove() {
        return this.disposables.add(( new DomEmitter(this.el, EventType.Change))).event;
    }
    get onPointerUp() {
        return this.disposables.add(( new DomEmitter(this.el, EventType.End))).event;
    }
    constructor(el) {
        this.el = el;
        this.disposables = ( new DisposableStore());
    }
    dispose() {
        this.disposables.dispose();
    }
}
GestureEventFactory.__decorator = ( __decorate([memoize], GestureEventFactory.prototype, "onPointerMove", null));
GestureEventFactory.__decorator = ( __decorate([memoize], GestureEventFactory.prototype, "onPointerUp", null));
class OrthogonalPointerEventFactory {
    get onPointerMove() {
        return this.factory.onPointerMove;
    }
    get onPointerUp() {
        return this.factory.onPointerUp;
    }
    constructor(factory) {
        this.factory = factory;
    }
    dispose() {}
}
OrthogonalPointerEventFactory.__decorator = ( __decorate([memoize], OrthogonalPointerEventFactory.prototype, "onPointerMove", null));
OrthogonalPointerEventFactory.__decorator = ( __decorate([memoize], OrthogonalPointerEventFactory.prototype, "onPointerUp", null));
const PointerEventsDisabledCssClass = "pointer-events-disabled";
class Sash extends Disposable {
    get state() {
        return this._state;
    }
    get orthogonalStartSash() {
        return this._orthogonalStartSash;
    }
    get orthogonalEndSash() {
        return this._orthogonalEndSash;
    }
    set state(state) {
        if (this._state === state) {
            return;
        }
        this.el.classList.toggle("disabled", state === SashState.Disabled);
        this.el.classList.toggle("minimum", state === SashState.AtMinimum);
        this.el.classList.toggle("maximum", state === SashState.AtMaximum);
        this._state = state;
        this.onDidEnablementChange.fire(state);
    }
    get onDidStart() {
        return this._onDidStart.event;
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    get onDidReset() {
        return this._onDidReset.event;
    }
    get onDidEnd() {
        return this._onDidEnd.event;
    }
    set orthogonalStartSash(sash) {
        if (this._orthogonalStartSash === sash) {
            return;
        }
        this.orthogonalStartDragHandleDisposables.clear();
        this.orthogonalStartSashDisposables.clear();
        if (sash) {
            const onChange = state => {
                this.orthogonalStartDragHandleDisposables.clear();
                if (state !== SashState.Disabled) {
                    this._orthogonalStartDragHandle = append(this.el, $(".orthogonal-drag-handle.start"));
                    this.orthogonalStartDragHandleDisposables.add(toDisposable(() => this._orthogonalStartDragHandle.remove()));
                    this.orthogonalStartDragHandleDisposables.add(addDisposableListener(
                        this._orthogonalStartDragHandle,
                        "mouseenter",
                        () => Sash.onMouseEnter(sash)
                    ));
                    this.orthogonalStartDragHandleDisposables.add(addDisposableListener(
                        this._orthogonalStartDragHandle,
                        "mouseleave",
                        () => Sash.onMouseLeave(sash)
                    ));
                }
            };
            this.orthogonalStartSashDisposables.add(sash.onDidEnablementChange.event(onChange, this));
            onChange(sash.state);
        }
        this._orthogonalStartSash = sash;
    }
    set orthogonalEndSash(sash) {
        if (this._orthogonalEndSash === sash) {
            return;
        }
        this.orthogonalEndDragHandleDisposables.clear();
        this.orthogonalEndSashDisposables.clear();
        if (sash) {
            const onChange = state => {
                this.orthogonalEndDragHandleDisposables.clear();
                if (state !== SashState.Disabled) {
                    this._orthogonalEndDragHandle = append(this.el, $(".orthogonal-drag-handle.end"));
                    this.orthogonalEndDragHandleDisposables.add(toDisposable(() => this._orthogonalEndDragHandle.remove()));
                    this.orthogonalEndDragHandleDisposables.add(
                        addDisposableListener(this._orthogonalEndDragHandle, "mouseenter", () => Sash.onMouseEnter(sash))
                    );
                    this.orthogonalEndDragHandleDisposables.add(
                        addDisposableListener(this._orthogonalEndDragHandle, "mouseleave", () => Sash.onMouseLeave(sash))
                    );
                }
            };
            this.orthogonalEndSashDisposables.add(sash.onDidEnablementChange.event(onChange, this));
            onChange(sash.state);
        }
        this._orthogonalEndSash = sash;
    }
    constructor(container, layoutProvider, options) {
        super();
        this.hoverDelay = globalHoverDelay;
        this.hoverDelayer = this._register(( new Delayer(this.hoverDelay)));
        this._state = SashState.Enabled;
        this.onDidEnablementChange = this._register(( new Emitter()));
        this._onDidStart = this._register(( new Emitter()));
        this._onDidChange = this._register(( new Emitter()));
        this._onDidReset = this._register(( new Emitter()));
        this._onDidEnd = this._register(( new Emitter()));
        this.orthogonalStartSashDisposables = this._register(( new DisposableStore()));
        this.orthogonalStartDragHandleDisposables = this._register(( new DisposableStore()));
        this.orthogonalEndSashDisposables = this._register(( new DisposableStore()));
        this.orthogonalEndDragHandleDisposables = this._register(( new DisposableStore()));
        this.linkedSash = undefined;
        this.el = append(container, $(".monaco-sash"));
        if (options.orthogonalEdge) {
            this.el.classList.add(`orthogonal-edge-${options.orthogonalEdge}`);
        }
        if (isMacintosh) {
            this.el.classList.add("mac");
        }
        this._register(
            addDisposableListener(this.el, "mousedown", e => this.onPointerStart(e, ( new MouseEventFactory(container))))
        );
        this._register(
            addDisposableListener(this.el, "dblclick", e => this.onPointerDoublePress(e))
        );
        this._register(
            addDisposableListener(this.el, "mouseenter", () => Sash.onMouseEnter(this))
        );
        this._register(
            addDisposableListener(this.el, "mouseleave", () => Sash.onMouseLeave(this))
        );
        this._register(Gesture.addTarget(this.el));
        this._register(
            addDisposableListener(this.el, EventType.Start, e => this.onPointerStart(e, ( new GestureEventFactory(this.el))))
        );
        let doubleTapTimeout = undefined;
        this._register(addDisposableListener(this.el, EventType.Tap, event => {
            if (doubleTapTimeout) {
                clearTimeout(doubleTapTimeout);
                doubleTapTimeout = undefined;
                this.onPointerDoublePress(event);
                return;
            }
            clearTimeout(doubleTapTimeout);
            doubleTapTimeout = setTimeout(() => doubleTapTimeout = undefined, 250);
        }));
        if (typeof options.size === "number") {
            this.size = options.size;
            if (options.orientation === Orientation.VERTICAL) {
                this.el.style.width = `${this.size}px`;
            } else {
                this.el.style.height = `${this.size}px`;
            }
        } else {
            this.size = globalSize;
            this._register(onDidChangeGlobalSize.event(size => {
                this.size = size;
                this.layout();
            }));
        }
        this._register(onDidChangeHoverDelay.event(delay => this.hoverDelay = delay));
        this.layoutProvider = layoutProvider;
        this.orthogonalStartSash = options.orthogonalStartSash;
        this.orthogonalEndSash = options.orthogonalEndSash;
        this.orientation = options.orientation || Orientation.VERTICAL;
        if (this.orientation === Orientation.HORIZONTAL) {
            this.el.classList.add("horizontal");
            this.el.classList.remove("vertical");
        } else {
            this.el.classList.remove("horizontal");
            this.el.classList.add("vertical");
        }
        this.el.classList.toggle("debug", DEBUG);
        this.layout();
    }
    onPointerStart(event, pointerEventFactory) {
        EventHelper.stop(event);
        let isMultisashResize = false;
        if (!event.__orthogonalSashEvent) {
            const orthogonalSash = this.getOrthogonalSash(event);
            if (orthogonalSash) {
                isMultisashResize = true;
                event.__orthogonalSashEvent = true;
                orthogonalSash.onPointerStart(event, ( new OrthogonalPointerEventFactory(pointerEventFactory)));
            }
        }
        if (this.linkedSash && !event.__linkedSashEvent) {
            event.__linkedSashEvent = true;
            this.linkedSash.onPointerStart(event, ( new OrthogonalPointerEventFactory(pointerEventFactory)));
        }
        if (!this.state) {
            return;
        }
        const iframes = this.el.getRootNode().querySelectorAll("iframe");
        for (const iframe of iframes) {
            iframe.classList.add(PointerEventsDisabledCssClass);
        }
        const startX = event.pageX;
        const startY = event.pageY;
        const altKey = event.altKey;
        const startEvent = {
            startX,
            currentX: startX,
            startY,
            currentY: startY,
            altKey
        };
        this.el.classList.add("active");
        this._onDidStart.fire(startEvent);
        const style = createStyleSheet(this.el);
        const updateStyle = () => {
            let cursor = "";
            if (isMultisashResize) {
                cursor = "all-scroll";
            } else if (this.orientation === Orientation.HORIZONTAL) {
                if (this.state === SashState.AtMinimum) {
                    cursor = "s-resize";
                } else if (this.state === SashState.AtMaximum) {
                    cursor = "n-resize";
                } else {
                    cursor = isMacintosh ? "row-resize" : "ns-resize";
                }
            } else {
                if (this.state === SashState.AtMinimum) {
                    cursor = "e-resize";
                } else if (this.state === SashState.AtMaximum) {
                    cursor = "w-resize";
                } else {
                    cursor = isMacintosh ? "col-resize" : "ew-resize";
                }
            }
            style.textContent = `* { cursor: ${cursor} !important; }`;
        };
        const disposables = ( new DisposableStore());
        updateStyle();
        if (!isMultisashResize) {
            this.onDidEnablementChange.event(updateStyle, null, disposables);
        }
        const onPointerMove = e => {
            EventHelper.stop(e, false);
            const event = {
                startX,
                currentX: e.pageX,
                startY,
                currentY: e.pageY,
                altKey
            };
            this._onDidChange.fire(event);
        };
        const onPointerUp = e => {
            EventHelper.stop(e, false);
            style.remove();
            this.el.classList.remove("active");
            this._onDidEnd.fire();
            disposables.dispose();
            for (const iframe of iframes) {
                iframe.classList.remove(PointerEventsDisabledCssClass);
            }
        };
        pointerEventFactory.onPointerMove(onPointerMove, null, disposables);
        pointerEventFactory.onPointerUp(onPointerUp, null, disposables);
        disposables.add(pointerEventFactory);
    }
    onPointerDoublePress(e) {
        const orthogonalSash = this.getOrthogonalSash(e);
        if (orthogonalSash) {
            orthogonalSash._onDidReset.fire();
        }
        if (this.linkedSash) {
            this.linkedSash._onDidReset.fire();
        }
        this._onDidReset.fire();
    }
    static onMouseEnter(sash, fromLinkedSash = false) {
        if (sash.el.classList.contains("active")) {
            sash.hoverDelayer.cancel();
            sash.el.classList.add("hover");
        } else {
            sash.hoverDelayer.trigger(() => sash.el.classList.add("hover"), sash.hoverDelay).then(undefined, () => {});
        }
        if (!fromLinkedSash && sash.linkedSash) {
            Sash.onMouseEnter(sash.linkedSash, true);
        }
    }
    static onMouseLeave(sash, fromLinkedSash = false) {
        sash.hoverDelayer.cancel();
        sash.el.classList.remove("hover");
        if (!fromLinkedSash && sash.linkedSash) {
            Sash.onMouseLeave(sash.linkedSash, true);
        }
    }
    clearSashHoverState() {
        Sash.onMouseLeave(this);
    }
    layout() {
        if (this.orientation === Orientation.VERTICAL) {
            const verticalProvider = this.layoutProvider;
            this.el.style.left = verticalProvider.getVerticalSashLeft(this) - (this.size / 2) + "px";
            if (verticalProvider.getVerticalSashTop) {
                this.el.style.top = verticalProvider.getVerticalSashTop(this) + "px";
            }
            if (verticalProvider.getVerticalSashHeight) {
                this.el.style.height = verticalProvider.getVerticalSashHeight(this) + "px";
            }
        } else {
            const horizontalProvider = this.layoutProvider;
            this.el.style.top = horizontalProvider.getHorizontalSashTop(this) - (this.size / 2) + "px";
            if (horizontalProvider.getHorizontalSashLeft) {
                this.el.style.left = horizontalProvider.getHorizontalSashLeft(this) + "px";
            }
            if (horizontalProvider.getHorizontalSashWidth) {
                this.el.style.width = horizontalProvider.getHorizontalSashWidth(this) + "px";
            }
        }
    }
    getOrthogonalSash(e) {
        const target = e.initialTarget ?? e.target;
        if (!target || !(isHTMLElement(target))) {
            return undefined;
        }
        if (target.classList.contains("orthogonal-drag-handle")) {
            return target.classList.contains("start") ? this.orthogonalStartSash : this.orthogonalEndSash;
        }
        return undefined;
    }
    dispose() {
        super.dispose();
        this.el.remove();
    }
}

export { Orientation, OrthogonalEdge, Sash, SashState, setGlobalHoverDelay, setGlobalSashSize };
