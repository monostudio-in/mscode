
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { EditorAutoSave } from './editorAutoSave.js';

registerWorkbenchContribution2(EditorAutoSave.ID, EditorAutoSave, WorkbenchPhase.BlockRestore);
