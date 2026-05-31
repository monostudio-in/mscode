
import { registerCss } from '../../../../../css.js';
import * as style from './media/style.css';
import { registerThemingParticipant } from '../../platform/theme/common/themeService.js';
import { WORKBENCH_BACKGROUND, TITLE_BAR_ACTIVE_BACKGROUND } from '../common/theme.js';
import { isWeb, isIOS } from '../../base/common/platform.js';
import { createMetaElement } from '../../base/browser/dom.js';
import { isSafari, isStandalone } from '../../base/browser/browser.js';
import '../../platform/theme/common/colorUtils.js';
import { selectionBackground } from '../../platform/theme/common/colors/baseColors.js';
import '../../platform/theme/common/colors/chartsColors.js';
import '../../platform/theme/common/colors/editorColors.js';
import '../../platform/theme/common/colors/inputColors.js';
import '../../platform/theme/common/colors/listColors.js';
import '../../platform/theme/common/colors/menuColors.js';
import '../../platform/theme/common/colors/minimapColors.js';
import '../../platform/theme/common/colors/miscColors.js';
import '../../platform/theme/common/colors/quickpickColors.js';
import '../../platform/theme/common/colors/searchColors.js';
import { mainWindow } from '../../base/browser/window.js';

registerCss(style);
registerThemingParticipant((theme, collector) => {
    const workbenchBackground = WORKBENCH_BACKGROUND(theme);
    collector.addRule(`.monaco-workbench-part { background-color: ${workbenchBackground}; }`);
    const windowSelectionBackground = theme.getColor(selectionBackground);
    if (windowSelectionBackground) {
        collector.addRule(
            `.monaco-workbench-part ::selection { background-color: ${windowSelectionBackground}; }`
        );
    }
    if (isWeb) {
        const titleBackground = theme.getColor(TITLE_BAR_ACTIVE_BACKGROUND);
        if (titleBackground) {
            const metaElementId = "monaco-workbench-meta-theme-color";
            let metaElement = mainWindow.document.getElementById(metaElementId);
            if (!metaElement) {
                metaElement = createMetaElement();
                metaElement.name = "theme-color";
                metaElement.id = metaElementId;
            }
            metaElement.content = ( titleBackground.toString());
        }
    }
    if (isSafari) {
        collector.addRule(`
            .monaco-workbench-part.web {
                touch-action: none;
            }
            .monaco-workbench-part .monaco-editor .view-lines {
                user-select: text;
                -webkit-user-select: text;
            }
        `);
    }
    if (isIOS && isStandalone()) {
        collector.addRule(`.monaco-workbench-part { background-color: ${workbenchBackground}; }`);
    }
});
