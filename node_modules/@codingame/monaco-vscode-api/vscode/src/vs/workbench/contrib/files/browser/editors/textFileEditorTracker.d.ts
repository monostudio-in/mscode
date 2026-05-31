import { IWorkbenchContribution } from "../../../../common/contributions.js";
import { ITextFileService } from "../../../../services/textfile/common/textfiles.service.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.service.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IHostService } from "../../../../services/host/browser/host.service.js";
import { IEditorService } from "../../../../services/editor/common/editorService.service.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.service.js";
import { IFilesConfigurationService } from "../../../../services/filesConfiguration/common/filesConfigurationService.service.js";
import { IWorkingCopyEditorService } from "../../../../services/workingCopy/common/workingCopyEditorService.service.js";
export declare class TextFileEditorTracker extends Disposable implements IWorkbenchContribution {
    private readonly editorService;
    private readonly textFileService;
    private readonly lifecycleService;
    private readonly hostService;
    private readonly codeEditorService;
    private readonly filesConfigurationService;
    private readonly workingCopyEditorService;
    static readonly ID = "workbench.contrib.textFileEditorTracker";
    constructor(editorService: IEditorService, textFileService: ITextFileService, lifecycleService: ILifecycleService, hostService: IHostService, codeEditorService: ICodeEditorService, filesConfigurationService: IFilesConfigurationService, workingCopyEditorService: IWorkingCopyEditorService);
    private registerListeners;
    private readonly ensureDirtyFilesAreOpenedWorker;
    protected getDirtyTextFileTrackerDelay(): number;
    private ensureDirtyTextFilesAreOpened;
    private doEnsureDirtyTextFilesAreOpened;
    private reloadVisibleTextFileEditors;
}
