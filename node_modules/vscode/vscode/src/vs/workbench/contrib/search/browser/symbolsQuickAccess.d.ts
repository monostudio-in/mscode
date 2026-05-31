import { IPickerQuickAccessItem, PickerQuickAccessProvider } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IWorkspaceSymbol } from "../common/search.js";
import { ILabelService } from "../../../../platform/label/common/label.service.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.service.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IQuickPickItemWithResource } from "../../../../platform/quickinput/common/quickInput.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.service.js";
import { IChatWidgetService } from "../../chat/browser/chat.service.js";
export interface ISymbolQuickPickItem extends IPickerQuickAccessItem, IQuickPickItemWithResource {
    score?: number;
    symbol?: IWorkspaceSymbol;
}
export declare class SymbolsQuickAccessProvider extends PickerQuickAccessProvider<ISymbolQuickPickItem> {
    private readonly labelService;
    private readonly openerService;
    private readonly editorService;
    private readonly configurationService;
    private readonly codeEditorService;
    private readonly chatWidgetService;
    static PREFIX: string;
    private static readonly TYPING_SEARCH_DELAY;
    private static TREAT_AS_GLOBAL_SYMBOL_TYPES;
    private delayer;
    get defaultFilterValue(): string | undefined;
    constructor(labelService: ILabelService, openerService: IOpenerService, editorService: IEditorService, configurationService: IConfigurationService, codeEditorService: ICodeEditorService, chatWidgetService: IChatWidgetService);
    private get configuration();
    protected _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken): Promise<Array<ISymbolQuickPickItem>>;
    getSymbolPicks(filter: string, options: {
        skipLocal?: boolean;
        skipSorting?: boolean;
        delay?: number;
    } | undefined, token: CancellationToken): Promise<Array<ISymbolQuickPickItem>>;
    private doGetSymbolPicks;
    private openSymbol;
    private compareSymbols;
}
