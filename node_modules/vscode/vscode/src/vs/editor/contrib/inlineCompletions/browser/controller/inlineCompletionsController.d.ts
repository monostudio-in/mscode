import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ITransaction } from "../../../../../base/common/observable.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.service.js";
import { IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.service.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.service.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.service.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.service.js";
import { IInstantiationService, ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.service.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { Range } from "../../../../common/core/range.js";
import { ILanguageFeatureDebounceService } from "../../../../common/services/languageFeatureDebounce.service.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.service.js";
import { InlineCompletionsModel } from "../model/inlineCompletionsModel.js";
import { InlineSuggestionsView } from "../view/inlineSuggestionsView.js";
export declare class InlineCompletionsController extends Disposable {
    readonly editor: ICodeEditor;
    private readonly _instantiationService;
    private readonly _contextKeyService;
    private readonly _configurationService;
    private readonly _commandService;
    private readonly _debounceService;
    private readonly _languageFeaturesService;
    private readonly _accessibilitySignalService;
    private readonly _keybindingService;
    private readonly _accessibilityService;
    private static readonly _instances;
    static hot: import("../../../../../base/common/observable.js").IObservable<typeof InlineCompletionsController>;
    static ID: string;
    /**
     * Find the controller in the focused editor or in the outer editor (if applicable)
     */
    static getInFocusedEditorOrParent(accessor: ServicesAccessor): InlineCompletionsController | null;
    static get(editor: ICodeEditor): InlineCompletionsController | null;
    private readonly _editorObs;
    private readonly _positions;
    private readonly _suggestWidgetAdapter;
    private readonly _enabledInConfig;
    private readonly _isScreenReaderEnabled;
    private readonly _editorDictationInProgress;
    private readonly _enabled;
    private readonly _debounceValue;
    private readonly _focusIsInMenu;
    private readonly _focusIsInEditorOrMenu;
    private readonly _cursorIsInIndentation;
    readonly model: import("../../../../../base/common/observable.js").IObservable<InlineCompletionsModel | undefined>;
    private readonly _playAccessibilitySignal;
    private readonly _hideInlineEditOnSelectionChange;
    protected readonly _view: import("../../../../../base/common/observable.js").IObservableWithChange<InlineSuggestionsView, void>;
    constructor(editor: ICodeEditor, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _configurationService: IConfigurationService, _commandService: ICommandService, _debounceService: ILanguageFeatureDebounceService, _languageFeaturesService: ILanguageFeaturesService, _accessibilitySignalService: IAccessibilitySignalService, _keybindingService: IKeybindingService, _accessibilityService: IAccessibilityService);
    playAccessibilitySignal(tx: ITransaction): void;
    private _provideScreenReaderUpdate;
    shouldShowHoverAt(range: Range): boolean;
    shouldShowHoverAtViewZone(viewZoneId: string): boolean;
    reject(): void;
    jump(): void;
}
