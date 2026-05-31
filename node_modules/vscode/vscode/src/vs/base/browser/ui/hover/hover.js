

var HoverStyle;
(function (HoverStyle) {
    HoverStyle[HoverStyle["Pointer"] = 1] = "Pointer";
    HoverStyle[HoverStyle["Mouse"] = 2] = "Mouse";
})(HoverStyle || (HoverStyle = {}));
function isManagedHoverTooltipMarkdownString(obj) {
    const candidate = obj;
    return typeof candidate === 'object' && 'markdown' in candidate && 'markdownNotSupportedFallback' in candidate;
}
function isManagedHoverTooltipHTMLElement(obj) {
    const candidate = obj;
    return typeof candidate === 'object' && 'element' in candidate;
}

export { HoverStyle, isManagedHoverTooltipHTMLElement, isManagedHoverTooltipMarkdownString };
