import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { AbstractCodeEditorService } from "../../../../editor/browser/services/abstractCodeEditorService.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { IEditorService } from "../common/editorService.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
export declare class CodeEditorService extends AbstractCodeEditorService {
    private readonly editorService;
    private readonly configurationService;
    constructor(editorService: IEditorService, themeService: IThemeService, configurationService: IConfigurationService);
    getActiveCodeEditor(): ICodeEditor | null;
    private doOpenCodeEditorFromDiff;
    private doOpenCodeEditor;
}
