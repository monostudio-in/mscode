

const editorFeatures = [];
function registerEditorFeature(ctor) {
    editorFeatures.push(ctor);
}
function getEditorFeatures() {
    return editorFeatures.slice(0);
}

export { getEditorFeatures, registerEditorFeature };
