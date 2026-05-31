
import { Toggle } from '../toggle/toggle.js';
import { Codicon } from '../../../common/codicons.js';
import { localize } from '../../../../nls.js';

const NLS_CASE_SENSITIVE_TOGGLE_LABEL = ( localize(11, "Match Case"));
const NLS_WHOLE_WORD_TOGGLE_LABEL = ( localize(12, "Match Whole Word"));
const NLS_REGEX_TOGGLE_LABEL = ( localize(13, "Use Regular Expression"));
class CaseSensitiveToggle extends Toggle {
    constructor(opts) {
        super({
            icon: Codicon.caseSensitive,
            title: NLS_CASE_SENSITIVE_TOGGLE_LABEL + opts.appendTitle,
            isChecked: opts.isChecked,
            hoverLifecycleOptions: opts.hoverLifecycleOptions,
            inputActiveOptionBorder: opts.inputActiveOptionBorder,
            inputActiveOptionForeground: opts.inputActiveOptionForeground,
            inputActiveOptionBackground: opts.inputActiveOptionBackground
        });
    }
}
class WholeWordsToggle extends Toggle {
    constructor(opts) {
        super({
            icon: Codicon.wholeWord,
            title: NLS_WHOLE_WORD_TOGGLE_LABEL + opts.appendTitle,
            isChecked: opts.isChecked,
            hoverLifecycleOptions: opts.hoverLifecycleOptions,
            inputActiveOptionBorder: opts.inputActiveOptionBorder,
            inputActiveOptionForeground: opts.inputActiveOptionForeground,
            inputActiveOptionBackground: opts.inputActiveOptionBackground
        });
    }
}
class RegexToggle extends Toggle {
    constructor(opts) {
        super({
            icon: Codicon.regex,
            title: NLS_REGEX_TOGGLE_LABEL + opts.appendTitle,
            isChecked: opts.isChecked,
            hoverLifecycleOptions: opts.hoverLifecycleOptions,
            inputActiveOptionBorder: opts.inputActiveOptionBorder,
            inputActiveOptionForeground: opts.inputActiveOptionForeground,
            inputActiveOptionBackground: opts.inputActiveOptionBackground
        });
    }
}

export { CaseSensitiveToggle, RegexToggle, WholeWordsToggle };
