import { Event } from "../../../../../base/common/event.js";
import { IKeyMods, IQuickPickSeparator, IQuickPick } from "../../../../../platform/quickinput/common/quickInput.js";
import { IEditorService } from "../../../../services/editor/common/editorService.service.js";
import { IRange } from "../../../../../editor/common/core/range.js";
import { AbstractGotoSymbolQuickAccessProvider, IGotoSymbolQuickPickItem } from "../../../../../editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.service.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { DisposableStore, IDisposable } from "../../../../../base/common/lifecycle.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { IPreparedQuery } from "../../../../../base/common/fuzzyScorer.js";
import { DocumentSymbol } from "../../../../../editor/common/languages.js";
import { IQuickAccessTextEditorContext } from "../../../../../editor/contrib/quickAccess/browser/editorNavigationQuickAccess.js";
import { IOutlineService } from "../../../../services/outline/browser/outline.service.js";
import { IOutlineModelService } from "../../../../../editor/contrib/documentSymbols/browser/outlineModel.service.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.service.js";
import { IChatWidgetService } from "../../../chat/browser/chat.service.js";
export declare class GotoSymbolQuickAccessProvider extends AbstractGotoSymbolQuickAccessProvider {
    private readonly editorService;
    private readonly configurationService;
    private readonly outlineService;
    private readonly chatWidgetService;
    protected readonly onDidActiveTextEditorControlChange: Event<void>;
    constructor(editorService: IEditorService, configurationService: IConfigurationService, languageFeaturesService: ILanguageFeaturesService, outlineService: IOutlineService, outlineModelService: IOutlineModelService, chatWidgetService: IChatWidgetService);
    private get configuration();
    protected get activeTextEditorControl(): import("../../../../../editor/common/editorCommon.js").IEditor | undefined;
    protected gotoLocation(context: IQuickAccessTextEditorContext, options: {
        range: IRange;
        keyMods: IKeyMods;
        forceSideBySide?: boolean;
        preserveFocus?: boolean;
    }): void;
    private static readonly SYMBOL_PICKS_TIMEOUT;
    getSymbolPicks(model: ITextModel, filter: string, options: {
        extraContainerLabel?: string;
    }, disposables: DisposableStore, token: CancellationToken): Promise<Array<IGotoSymbolQuickPickItem | IQuickPickSeparator>>;
    protected doGetSymbolPicks(symbolsPromise: Promise<DocumentSymbol[]>, query: IPreparedQuery, options: {
        extraContainerLabel?: string;
    } | undefined, token: CancellationToken, model: ITextModel): Promise<Array<IGotoSymbolQuickPickItem | IQuickPickSeparator>>;
    protected provideWithoutTextEditor(picker: IQuickPick<IGotoSymbolQuickPickItem, {
        useSeparators: true;
    }>): IDisposable;
    private canPickWithOutlineService;
    private doGetOutlinePicks;
}
