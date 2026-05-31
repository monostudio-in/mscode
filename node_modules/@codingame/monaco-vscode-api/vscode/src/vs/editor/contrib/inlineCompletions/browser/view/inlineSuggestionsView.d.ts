import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IObservable, ISettableObservable } from "../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { InlineCompletionsModel } from "../model/inlineCompletionsModel.js";
import { InlineEditsGutterIndicator } from "./inlineEdits/components/gutterIndicatorView.js";
export declare class InlineSuggestionsView extends Disposable {
    private readonly _editor;
    private readonly _model;
    private readonly _focusIsInMenu;
    private readonly _instantiationService;
    static hot: IObservable<typeof InlineSuggestionsView>;
    private readonly _ghostTexts;
    private readonly _stablizedGhostTexts;
    private readonly _editorObs;
    private readonly _ghostTextWidgets;
    private readonly _inlineEdit;
    private readonly _everHadInlineEdit;
    private readonly _indicatorIsHoverVisible;
    private readonly _showInlineEditCollapsed;
    private readonly _inlineEditWidget;
    private readonly _fontFamily;
    constructor(_editor: ICodeEditor, _model: IObservable<InlineCompletionsModel | undefined>, _focusIsInMenu: ISettableObservable<boolean>, _instantiationService: IInstantiationService);
    private _createGhostText;
    shouldShowHoverAtViewZone(viewZoneId: string): boolean;
    private readonly _gutterIndicatorState;
    protected readonly _indicator: InlineEditsGutterIndicator;
}
