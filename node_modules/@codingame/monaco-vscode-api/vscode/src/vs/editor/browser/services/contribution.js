
import '../../../platform/instantiation/common/extensions.js';
import '../../../platform/instantiation/common/instantiation.js';
import { registerEditorContribution, EditorContributionInstantiation } from '../editorExtensions.js';
import './editorWorkerService.js';
import { MarkerDecorationsContribution } from './markerDecorations.js';

registerEditorContribution(
    MarkerDecorationsContribution.ID,
    MarkerDecorationsContribution,
    EditorContributionInstantiation.Eager
);
