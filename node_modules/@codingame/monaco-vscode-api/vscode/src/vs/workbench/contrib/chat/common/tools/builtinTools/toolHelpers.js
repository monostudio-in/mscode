

function createToolSimpleTextResult(value) {
    return {
        content: [{
                kind: 'text',
                value
            }]
    };
}

export { createToolSimpleTextResult };
