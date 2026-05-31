import { MainThreadThemingShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IThemeService } from "@codingame/monaco-vscode-api/vscode/vs/platform/theme/common/themeService.service";
export declare class MainThreadTheming implements MainThreadThemingShape {
    private readonly _themeService;
    private readonly _proxy;
    private readonly _themeChangeListener;
    constructor(extHostContext: IExtHostContext, themeService: IThemeService);
    dispose(): void;
}
