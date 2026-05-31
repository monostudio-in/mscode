
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Dimension, append, trackFocus, getClientArea, getDomNodePagePosition, getTotalHeight, getActiveElement, getTotalWidth } from '../../../../base/browser/dom.js';
import { ContentWidgetPositionPreference } from '../../../browser/editorBrowser.js';
import { EditorOption } from '../../../common/config/editorOptions.js';
import { HoverStartSource } from './hoverOperation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.service.js';
import { ResizableContentWidget } from './resizableContentWidget.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.service.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.service.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { HoverWidget, getHoverAccessibleViewHint } from '../../../../base/browser/ui/hover/hoverWidget.js';
import { PositionAffinity } from '../../../common/model.js';
import { Emitter } from '../../../../base/common/event.js';

var ContentHoverWidget_1;
const HORIZONTAL_SCROLLING_BY = 30;
let ContentHoverWidget = class ContentHoverWidget extends ResizableContentWidget {
    static {
        ContentHoverWidget_1 = this;
    }
    static {
        this.ID = "editor.contrib.resizableContentHoverWidget";
    }
    static {
        this._lastDimensions = new Dimension(0, 0);
    }
    get isVisibleFromKeyboard() {
        return (this._renderedHover?.source === HoverStartSource.Keyboard);
    }
    get isVisible() {
        return this._hoverVisibleKey.get() ?? false;
    }
    get isFocused() {
        return this._hoverFocusedKey.get() ?? false;
    }
    constructor(
        editor,
        contextKeyService,
        _configurationService,
        _accessibilityService,
        _keybindingService
    ) {
        const minimumHeight = editor.getOption(EditorOption.lineHeight) + 8;
        const minimumWidth = 150;
        const minimumSize = new Dimension(minimumWidth, minimumHeight);
        super(editor, minimumSize);
        this._configurationService = _configurationService;
        this._accessibilityService = _accessibilityService;
        this._keybindingService = _keybindingService;
        this._hover = this._register(( new HoverWidget(true)));
        this._onDidResize = this._register(( new Emitter()));
        this.onDidResize = this._onDidResize.event;
        this._onDidScroll = this._register(( new Emitter()));
        this.onDidScroll = this._onDidScroll.event;
        this._onContentsChanged = this._register(( new Emitter()));
        this.onContentsChanged = this._onContentsChanged.event;
        this._minimumSize = minimumSize;
        this._hoverVisibleKey = EditorContextKeys.hoverVisible.bindTo(contextKeyService);
        this._hoverFocusedKey = EditorContextKeys.hoverFocused.bindTo(contextKeyService);
        append(this._resizableNode.domNode, this._hover.containerDomNode);
        this._resizableNode.domNode.style.zIndex = "50";
        this._resizableNode.domNode.className = "monaco-resizable-hover";
        this._register(this._editor.onDidLayoutChange(() => {
            if (this.isVisible) {
                this._updateMaxDimensions();
            }
        }));
        this._register(this._editor.onDidChangeConfiguration(e => {
            if (e.hasChanged(EditorOption.fontInfo)) {
                this._updateFont();
            }
        }));
        const focusTracker = this._register(trackFocus(this._resizableNode.domNode));
        this._register(focusTracker.onDidFocus(() => {
            this._hoverFocusedKey.set(true);
        }));
        this._register(focusTracker.onDidBlur(() => {
            this._hoverFocusedKey.set(false);
        }));
        this._register(this._hover.scrollbar.onScroll(e => {
            this._onDidScroll.fire(e);
        }));
        this._setRenderedHover(undefined);
        this._editor.addContentWidget(this);
    }
    dispose() {
        super.dispose();
        this._renderedHover?.dispose();
        this._editor.removeContentWidget(this);
    }
    getId() {
        return ContentHoverWidget_1.ID;
    }
    static _applyDimensions(container, width, height) {
        const transformedWidth = typeof width === "number" ? `${width}px` : width;
        const transformedHeight = typeof height === "number" ? `${height}px` : height;
        container.style.width = transformedWidth;
        container.style.height = transformedHeight;
    }
    _setContentsDomNodeDimensions(width, height) {
        const contentsDomNode = this._hover.contentsDomNode;
        return ContentHoverWidget_1._applyDimensions(contentsDomNode, width, height);
    }
    _setContainerDomNodeDimensions(width, height) {
        const containerDomNode = this._hover.containerDomNode;
        return ContentHoverWidget_1._applyDimensions(containerDomNode, width, height);
    }
    _setScrollableElementDimensions(width, height) {
        const scrollbarDomElement = this._hover.scrollbar.getDomNode();
        return ContentHoverWidget_1._applyDimensions(scrollbarDomElement, width, height);
    }
    _setHoverWidgetDimensions(width, height) {
        this._setContainerDomNodeDimensions(width, height);
        this._setScrollableElementDimensions(width, height);
        this._setContentsDomNodeDimensions(width, height);
        this._layoutContentWidget();
    }
    static _applyMaxDimensions(container, width, height) {
        const transformedWidth = typeof width === "number" ? `${width}px` : width;
        const transformedHeight = typeof height === "number" ? `${height}px` : height;
        container.style.maxWidth = transformedWidth;
        container.style.maxHeight = transformedHeight;
    }
    _setHoverWidgetMaxDimensions(width, height) {
        ContentHoverWidget_1._applyMaxDimensions(this._hover.contentsDomNode, width, height);
        ContentHoverWidget_1._applyMaxDimensions(this._hover.scrollbar.getDomNode(), width, height);
        ContentHoverWidget_1._applyMaxDimensions(this._hover.containerDomNode, width, height);
        this._hover.containerDomNode.style.setProperty(
            "--vscode-hover-maxWidth",
            typeof width === "number" ? `${width}px` : width
        );
        this._layoutContentWidget();
    }
    _setAdjustedHoverWidgetDimensions(size) {
        this._setHoverWidgetMaxDimensions("none", "none");
        this._setHoverWidgetDimensions(size.width, size.height);
    }
    _updateResizableNodeMaxDimensions() {
        const maxRenderingWidth = this._findMaximumRenderingWidth() ?? Infinity;
        const maxRenderingHeight = this._findMaximumRenderingHeight() ?? Infinity;
        this._resizableNode.maxSize = new Dimension(maxRenderingWidth, maxRenderingHeight);
        this._setHoverWidgetMaxDimensions(maxRenderingWidth, maxRenderingHeight);
    }
    _resize(size) {
        ContentHoverWidget_1._lastDimensions = new Dimension(size.width, size.height);
        this._setAdjustedHoverWidgetDimensions(size);
        this._resizableNode.layout(size.height, size.width);
        this._updateResizableNodeMaxDimensions();
        this._hover.scrollbar.scanDomNode();
        this._editor.layoutContentWidget(this);
        this._onDidResize.fire();
    }
    _findAvailableSpaceVertically() {
        const position = this._renderedHover?.showAtPosition;
        if (!position) {
            return;
        }
        return this._positionPreference === ContentWidgetPositionPreference.ABOVE ? this._availableVerticalSpaceAbove(position) : this._availableVerticalSpaceBelow(position);
    }
    _findMaximumRenderingHeight() {
        const availableSpace = this._findAvailableSpaceVertically();
        if (!availableSpace) {
            return;
        }
        const children = this._hover.contentsDomNode.children;
        let maximumHeight = children.length - 1;
        Array.from(this._hover.contentsDomNode.children).forEach(hoverPart => {
            maximumHeight += hoverPart.clientHeight;
        });
        return Math.min(availableSpace, maximumHeight);
    }
    _isHoverTextOverflowing() {
        this._hover.containerDomNode.style.setProperty("--vscode-hover-whiteSpace", "nowrap");
        this._hover.containerDomNode.style.setProperty("--vscode-hover-sourceWhiteSpace", "nowrap");
        const overflowing = ( Array.from(this._hover.contentsDomNode.children).some(hoverElement => {
            return hoverElement.scrollWidth > hoverElement.clientWidth;
        }));
        this._hover.containerDomNode.style.removeProperty("--vscode-hover-whiteSpace");
        this._hover.containerDomNode.style.removeProperty("--vscode-hover-sourceWhiteSpace");
        return overflowing;
    }
    _findMaximumRenderingWidth() {
        if (!this._editor || !this._editor.hasModel()) {
            return;
        }
        const overflowing = this._isHoverTextOverflowing();
        const initialWidth = (typeof this._contentWidth === "undefined" ? 0 : this._contentWidth);
        if (overflowing || this._hover.containerDomNode.clientWidth < initialWidth) {
            const bodyBoxWidth = getClientArea(this._hover.containerDomNode.ownerDocument.body).width;
            const horizontalPadding = 14;
            return bodyBoxWidth - horizontalPadding;
        } else {
            return this._hover.containerDomNode.clientWidth;
        }
    }
    isMouseGettingCloser(posx, posy) {
        if (!this._renderedHover) {
            return false;
        }
        if (this._renderedHover.initialMousePosX === undefined || this._renderedHover.initialMousePosY === undefined) {
            this._renderedHover.initialMousePosX = posx;
            this._renderedHover.initialMousePosY = posy;
            return false;
        }
        const widgetRect = getDomNodePagePosition(this.getDomNode());
        if (this._renderedHover.closestMouseDistance === undefined) {
            this._renderedHover.closestMouseDistance = computeDistanceFromPointToRectangle(
                this._renderedHover.initialMousePosX,
                this._renderedHover.initialMousePosY,
                widgetRect.left,
                widgetRect.top,
                widgetRect.width,
                widgetRect.height
            );
        }
        const distance = computeDistanceFromPointToRectangle(
            posx,
            posy,
            widgetRect.left,
            widgetRect.top,
            widgetRect.width,
            widgetRect.height
        );
        if (distance > this._renderedHover.closestMouseDistance + 4 ) {
            return false;
        }
        this._renderedHover.closestMouseDistance = Math.min(this._renderedHover.closestMouseDistance, distance);
        return true;
    }
    _setRenderedHover(renderedHover) {
        this._renderedHover?.dispose();
        this._renderedHover = renderedHover;
        this._hoverVisibleKey.set(!!renderedHover);
        this._hover.containerDomNode.classList.toggle("hidden", !renderedHover);
    }
    _updateFont() {
        const {
            fontSize,
            lineHeight
        } = this._editor.getOption(EditorOption.fontInfo);
        const contentsDomNode = this._hover.contentsDomNode;
        contentsDomNode.style.fontSize = `${fontSize}px`;
        contentsDomNode.style.lineHeight = `${lineHeight / fontSize}`;
        const codeClasses = Array.prototype.slice.call(this._hover.contentsDomNode.getElementsByClassName("code"));
        codeClasses.forEach(node => this._editor.applyFontInfo(node));
    }
    _updateContent(node) {
        const contentsDomNode = this._hover.contentsDomNode;
        contentsDomNode.style.paddingBottom = "";
        contentsDomNode.textContent = "";
        contentsDomNode.appendChild(node);
    }
    _layoutContentWidget() {
        this._editor.layoutContentWidget(this);
        this._hover.onContentsChanged();
    }
    _updateMaxDimensions() {
        const height = Math.max(
            this._editor.getLayoutInfo().height / 4,
            250,
            ContentHoverWidget_1._lastDimensions.height
        );
        const width = Math.max(
            this._editor.getLayoutInfo().width * 0.66,
            750,
            ContentHoverWidget_1._lastDimensions.width
        );
        this._resizableNode.maxSize = new Dimension(width, height);
        this._setHoverWidgetMaxDimensions(width, height);
    }
    _render(renderedHover) {
        this._setRenderedHover(renderedHover);
        this._updateFont();
        this._updateContent(renderedHover.domNode);
        this.handleContentsChanged();
        this._editor.render();
    }
    getPosition() {
        if (!this._renderedHover) {
            return null;
        }
        return {
            position: this._renderedHover.showAtPosition,
            secondaryPosition: this._renderedHover.showAtSecondaryPosition,
            positionAffinity: this._renderedHover.shouldAppearBeforeContent ? PositionAffinity.LeftOfInjectedText : undefined,
            preference: [this._positionPreference ?? ContentWidgetPositionPreference.ABOVE]
        };
    }
    show(renderedHover) {
        if (!this._editor || !this._editor.hasModel()) {
            return;
        }
        this._render(renderedHover);
        const widgetHeight = getTotalHeight(this._hover.containerDomNode);
        const widgetPosition = renderedHover.showAtPosition;
        this._positionPreference = this._findPositionPreference(widgetHeight, widgetPosition) ?? ContentWidgetPositionPreference.ABOVE;
        this.handleContentsChanged();
        if (renderedHover.shouldFocus) {
            this._hover.containerDomNode.focus();
        }
        this._onDidResize.fire();
        const hoverFocused = getActiveElement(this._hover.containerDomNode.ownerDocument) === this._hover.containerDomNode;
        const accessibleViewHint = hoverFocused && getHoverAccessibleViewHint(
            this._configurationService.getValue("accessibility.verbosity.hover") === true && this._accessibilityService.isScreenReaderOptimized(),
            this._keybindingService.lookupKeybinding("editor.action.accessibleView")?.getAriaLabel() ?? ""
        );
        if (accessibleViewHint) {
            this._hover.contentsDomNode.ariaLabel = this._hover.contentsDomNode.textContent + ", " + accessibleViewHint;
        }
    }
    hide() {
        if (!this._renderedHover) {
            return;
        }
        const hoverStoleFocus = this._renderedHover.shouldFocus || this._hoverFocusedKey.get();
        this._setRenderedHover(undefined);
        this._resizableNode.maxSize = new Dimension(Infinity, Infinity);
        this._resizableNode.clearSashHoverState();
        this._hoverFocusedKey.set(false);
        this._editor.layoutContentWidget(this);
        if (hoverStoleFocus) {
            this._editor.focus();
        }
    }
    _removeConstraintsRenderNormally() {
        const layoutInfo = this._editor.getLayoutInfo();
        this._resizableNode.layout(layoutInfo.height, layoutInfo.width);
        this._setHoverWidgetDimensions("auto", "auto");
        this._updateMaxDimensions();
    }
    setMinimumDimensions(dimensions) {
        this._minimumSize = new Dimension(
            Math.max(this._minimumSize.width, dimensions.width),
            Math.max(this._minimumSize.height, dimensions.height)
        );
        this._updateMinimumWidth();
    }
    _updateMinimumWidth() {
        const width = (typeof this._contentWidth === "undefined" ? this._minimumSize.width : Math.min(this._contentWidth, this._minimumSize.width));
        this._resizableNode.minSize = new Dimension(width, this._minimumSize.height);
    }
    handleContentsChanged() {
        this._removeConstraintsRenderNormally();
        const contentsDomNode = this._hover.contentsDomNode;
        let height = getTotalHeight(contentsDomNode);
        let width = getTotalWidth(contentsDomNode) + 2;
        this._resizableNode.layout(height, width);
        this._setHoverWidgetDimensions(width, height);
        height = getTotalHeight(contentsDomNode);
        width = getTotalWidth(contentsDomNode);
        this._contentWidth = width;
        this._updateMinimumWidth();
        this._resizableNode.layout(height, width);
        if (this._renderedHover?.showAtPosition) {
            const widgetHeight = getTotalHeight(this._hover.containerDomNode);
            this._positionPreference = this._findPositionPreference(widgetHeight, this._renderedHover.showAtPosition);
        }
        this._layoutContentWidget();
        this._onContentsChanged.fire();
    }
    focus() {
        this._hover.containerDomNode.focus();
    }
    scrollUp() {
        const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
        const fontInfo = this._editor.getOption(EditorOption.fontInfo);
        this._hover.scrollbar.setScrollPosition({
            scrollTop: scrollTop - fontInfo.lineHeight
        });
    }
    scrollDown() {
        const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
        const fontInfo = this._editor.getOption(EditorOption.fontInfo);
        this._hover.scrollbar.setScrollPosition({
            scrollTop: scrollTop + fontInfo.lineHeight
        });
    }
    scrollLeft() {
        const scrollLeft = this._hover.scrollbar.getScrollPosition().scrollLeft;
        this._hover.scrollbar.setScrollPosition({
            scrollLeft: scrollLeft - HORIZONTAL_SCROLLING_BY
        });
    }
    scrollRight() {
        const scrollLeft = this._hover.scrollbar.getScrollPosition().scrollLeft;
        this._hover.scrollbar.setScrollPosition({
            scrollLeft: scrollLeft + HORIZONTAL_SCROLLING_BY
        });
    }
    pageUp() {
        const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
        const scrollHeight = this._hover.scrollbar.getScrollDimensions().height;
        this._hover.scrollbar.setScrollPosition({
            scrollTop: scrollTop - scrollHeight
        });
    }
    pageDown() {
        const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
        const scrollHeight = this._hover.scrollbar.getScrollDimensions().height;
        this._hover.scrollbar.setScrollPosition({
            scrollTop: scrollTop + scrollHeight
        });
    }
    goToTop() {
        this._hover.scrollbar.setScrollPosition({
            scrollTop: 0
        });
    }
    goToBottom() {
        this._hover.scrollbar.setScrollPosition({
            scrollTop: this._hover.scrollbar.getScrollDimensions().scrollHeight
        });
    }
};
ContentHoverWidget = ContentHoverWidget_1 = ( __decorate([( __param(1, IContextKeyService)), ( __param(2, IConfigurationService)), ( __param(3, IAccessibilityService)), ( __param(4, IKeybindingService))], ContentHoverWidget));
function computeDistanceFromPointToRectangle(pointX, pointY, left, top, width, height) {
    const x = (left + width / 2);
    const y = (top + height / 2);
    const dx = Math.max(Math.abs(pointX - x) - width / 2, 0);
    const dy = Math.max(Math.abs(pointY - y) - height / 2, 0);
    return Math.sqrt(dx * dx + dy * dy);
}

export { ContentHoverWidget };
