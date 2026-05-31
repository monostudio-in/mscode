
import { registerCss } from '../../../../../../../css.js';
import * as severityIcon from './media/severityIcon.css';
import { Codicon } from '../../../common/codicons.js';
import { ThemeIcon } from '../../../common/themables.js';
import Severity$1 from '../../../common/severity.js';

registerCss(severityIcon);
var SeverityIcon;
(function(SeverityIcon) {
    function className(severity) {
        switch (severity) {
        case Severity$1.Ignore:
            return "severity-ignore " + ThemeIcon.asClassName(Codicon.info);
        case Severity$1.Info:
            return ThemeIcon.asClassName(Codicon.info);
        case Severity$1.Warning:
            return ThemeIcon.asClassName(Codicon.warning);
        case Severity$1.Error:
            return ThemeIcon.asClassName(Codicon.error);
        default:
            return "";
        }
    }
    SeverityIcon.className = className;
})(SeverityIcon || (SeverityIcon = {}));

export { SeverityIcon };
