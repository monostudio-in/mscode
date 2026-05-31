import { CancellationToken } from "@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation";
import { ILanguageService } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/languages/language.service";
import { IModelService } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/services/model.service";
import { ILabelService } from "@codingame/monaco-vscode-api/vscode/vs/platform/label/common/label.service";
import { IPickOptions } from "@codingame/monaco-vscode-api/vscode/vs/platform/quickinput/common/quickInput";
import { IQuickInputService } from "@codingame/monaco-vscode-api/vscode/vs/platform/quickinput/common/quickInput.service";
import { ICustomEditorLabelService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/customEditorLabelService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IInputBoxOptions, MainThreadQuickOpenShape, TransferQuickInput, TransferQuickPickItem, TransferQuickPickItemOrSeparator } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadQuickOpen implements MainThreadQuickOpenShape {
    private readonly labelService;
    private readonly customEditorLabelService;
    private readonly modelService;
    private readonly languageService;
    private readonly _proxy;
    private readonly _quickInputService;
    private readonly _items;
    constructor(extHostContext: IExtHostContext, quickInputService: IQuickInputService, labelService: ILabelService, customEditorLabelService: ICustomEditorLabelService, modelService: IModelService, languageService: ILanguageService);
    dispose(): void;
    $show(instance: number, options: IPickOptions<TransferQuickPickItem>, token: CancellationToken): Promise<number | number[] | undefined>;
    $setItems(instance: number, items: TransferQuickPickItemOrSeparator[]): Promise<void>;
    $setError(instance: number, error: Error): Promise<void>;
    $input(options: IInputBoxOptions | undefined, validateInput: boolean, token: CancellationToken): Promise<string | undefined>;
    private sessions;
    $createOrUpdate(params: TransferQuickInput): Promise<void>;
    $dispose(sessionId: number): Promise<void>;
    /**
    * Derives icon, label and description for Quick Pick items that represent a resource URI.
    */
    private expandItemProps;
    /**
    * Converts IconPath DTO into iconPath/iconClass properties.
    */
    private expandIconPath;
}
