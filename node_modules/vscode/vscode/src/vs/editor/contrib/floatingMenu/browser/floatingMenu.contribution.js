
import { registerCss } from '../../../../../../../css.js';
import * as floatingMenu from './floatingMenu.css';
import { registerEditorContribution, EditorContributionInstantiation } from '../../../browser/editorExtensions.js';
import { FloatingEditorToolbar } from './floatingMenu.js';

registerCss(floatingMenu);
registerEditorContribution(
    FloatingEditorToolbar.ID,
    FloatingEditorToolbar,
    EditorContributionInstantiation.AfterFirstRender
);
