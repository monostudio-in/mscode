

let _getInlineCompletionsController;
function getInlineCompletionsController(editor) {
    return _getInlineCompletionsController?.(editor) ?? null;
}
function setInlineCompletionsControllerGetter(getter) {
    _getInlineCompletionsController = getter;
}

export { getInlineCompletionsController, setInlineCompletionsControllerGetter };
