
import { __decorate, __param } from '../../../../../../../../../external/tslib/tslib.es6.js';
import { Disposable, MutableDisposable } from '../../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.service.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ChatConfiguration } from '../../constants.js';
import { ILanguageModelToolsService } from '../languageModelToolsService.service.js';
import { AskQuestionsTool, AskQuestionsToolData } from './askQuestionsTool.js';
import { ConfirmationTool, ConfirmationToolData, ConfirmationToolWithOptionsData, ModifiedFilesConfirmationTool, ModifiedFilesConfirmationToolData } from './confirmationTool.js';
import { EditTool, EditToolData } from './editFileTool.js';
import { createManageTodoListToolData, ManageTodoListTool } from './manageTodoListTool.js';
import { ReviewPlanTool, ReviewPlanToolData } from './reviewPlanTool.js';
import { RunSubagentTool } from './runSubagentTool.js';
import { SetArtifactsTool, SetArtifactsToolData } from './setArtifactsTool.js';
import { SetArtifactRulesTool, SetArtifactRulesToolData } from './setArtifactRulesTool.js';
import { TaskCompleteTool, TaskCompleteToolData } from './taskCompleteTool.js';

let BuiltinToolsContribution = class BuiltinToolsContribution extends Disposable {
    static {
        this.ID = "chat.builtinTools";
    }
    constructor(toolsService, instantiationService, configurationService) {
        super();
        const editTool = instantiationService.createInstance(EditTool);
        this._register(toolsService.registerTool(EditToolData, editTool));
        const askQuestionsTool = this._register(instantiationService.createInstance(AskQuestionsTool));
        this._register(toolsService.registerTool(AskQuestionsToolData, askQuestionsTool));
        this._register(toolsService.vscodeToolSet.addTool(AskQuestionsToolData));
        const reviewPlanTool = this._register(instantiationService.createInstance(ReviewPlanTool));
        this._register(toolsService.registerTool(ReviewPlanToolData, reviewPlanTool));
        const todoToolData = createManageTodoListToolData();
        const manageTodoListTool = this._register(instantiationService.createInstance(ManageTodoListTool));
        this._register(toolsService.registerTool(todoToolData, manageTodoListTool));
        const confirmationTool = instantiationService.createInstance(ConfirmationTool);
        this._register(toolsService.registerTool(ConfirmationToolData, confirmationTool));
        this._register(
            toolsService.registerTool(ConfirmationToolWithOptionsData, confirmationTool)
        );
        const modifiedFilesConfirmationTool = instantiationService.createInstance(ModifiedFilesConfirmationTool);
        this._register(
            toolsService.registerTool(ModifiedFilesConfirmationToolData, modifiedFilesConfirmationTool)
        );
        const taskCompleteTool = instantiationService.createInstance(TaskCompleteTool);
        this._register(toolsService.registerTool(TaskCompleteToolData, taskCompleteTool));
        const setArtifactsTool = instantiationService.createInstance(SetArtifactsTool);
        const setArtifactRulesTool = instantiationService.createInstance(SetArtifactRulesTool);
        const setArtifactsRegistration = this._register(( new MutableDisposable()));
        const setArtifactRulesRegistration = this._register(( new MutableDisposable()));
        const updateArtifactsRegistration = () => {
            if (configurationService.getValue(ChatConfiguration.ArtifactsEnabled)) {
                if (!setArtifactsRegistration.value) {
                    setArtifactsRegistration.value = toolsService.registerTool(SetArtifactsToolData, setArtifactsTool);
                }
                if (!setArtifactRulesRegistration.value) {
                    setArtifactRulesRegistration.value = toolsService.registerTool(SetArtifactRulesToolData, setArtifactRulesTool);
                }
            } else {
                setArtifactsRegistration.clear();
                setArtifactRulesRegistration.clear();
            }
        };
        updateArtifactsRegistration();
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(ChatConfiguration.ArtifactsEnabled)) {
                updateArtifactsRegistration();
            }
        }));
        const runSubagentTool = this._register(instantiationService.createInstance(RunSubagentTool));
        let runSubagentRegistration;
        let toolSetRegistration;
        const registerRunSubagentTool = () => {
            runSubagentRegistration?.dispose();
            toolSetRegistration?.dispose();
            toolsService.flushToolUpdates();
            const runSubagentToolData = runSubagentTool.getToolData();
            runSubagentRegistration = toolsService.registerTool(runSubagentToolData, runSubagentTool);
            toolSetRegistration = toolsService.agentToolSet.addTool(runSubagentToolData);
        };
        registerRunSubagentTool();
        this._register(runSubagentTool.onDidUpdateToolData(registerRunSubagentTool));
        this._register({
            dispose: () => {
                runSubagentRegistration?.dispose();
                toolSetRegistration?.dispose();
            }
        });
    }
};
BuiltinToolsContribution = ( __decorate([( __param(0, ILanguageModelToolsService)), ( __param(1, IInstantiationService)), ( __param(2, IConfigurationService))], BuiltinToolsContribution));
const InternalFetchWebPageToolId = "vscode_fetchWebPage_internal";

export { BuiltinToolsContribution, InternalFetchWebPageToolId };
