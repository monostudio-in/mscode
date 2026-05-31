
import { registerEditorContribution, EditorContributionInstantiation } from '../../../browser/editorExtensions.js';
import { ToggleStickyScroll, FocusStickyScroll, SelectPreviousStickyScrollLine, SelectNextStickyScrollLine, GoToStickyScrollLine, SelectEditor } from './stickyScrollActions.js';
import { StickyScrollController } from './stickyScrollController.js';
import { registerAction2 } from '../../../../platform/actions/common/actions.js';

registerEditorContribution(StickyScrollController.ID, StickyScrollController, EditorContributionInstantiation.AfterFirstRender);
registerAction2(ToggleStickyScroll);
registerAction2(FocusStickyScroll);
registerAction2(SelectPreviousStickyScrollLine);
registerAction2(SelectNextStickyScrollLine);
registerAction2(GoToStickyScrollLine);
registerAction2(SelectEditor);
