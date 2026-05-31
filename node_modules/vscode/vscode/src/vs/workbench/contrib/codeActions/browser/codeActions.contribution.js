
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as Extensions$1 } from '../../../common/contributions.js';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.js';
import { editorConfiguration, notebookEditorConfiguration, CodeActionsContribution } from './codeActionsContribution.js';

( Registry.as(Extensions.Configuration)).registerConfiguration(editorConfiguration);
( Registry.as(Extensions.Configuration)).registerConfiguration(notebookEditorConfiguration);
( Registry.as(Extensions$1.Workbench)).registerWorkbenchContribution(CodeActionsContribution, LifecyclePhase.Eventually);
