

const isSimpleNameRegex = /^[\w\/\.-]+$/;
function formatArrayValue(name, quotePreference) {
    switch (quotePreference) {
        case '\'':
            return `'${name}'`;
        case '"':
            return `"${name}"`;
    }
    return isSimpleNameRegex.test(name) ? name : `'${name}'`;
}
function getQuotePreference(arrayValue, model) {
    const firstStringItem = arrayValue.items.find(item => item.type === 'scalar' && isSimpleNameRegex.test(item.value));
    const firstChar = firstStringItem ? model.getValueInRange(firstStringItem.range).charAt(0) : undefined;
    if (firstChar === `'` || firstChar === `"`) {
        return firstChar;
    }
    return '';
}

export { formatArrayValue, getQuotePreference };
