import { Disposable } from "../../../../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor } from "../../../../../../../browser/editorBrowser.js";
import { EmbeddedCodeEditorWidget } from "../../../../../../../browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { IDimension } from "../../../../../../../common/core/2d/dimension.js";
import { Position } from "../../../../../../../common/core/position.js";
import { OffsetRange } from "../../../../../../../common/core/ranges/offsetRange.js";
import { DetailedLineRangeMapping } from "../../../../../../../common/diff/rangeMapping.js";
import { ITextModel } from "../../../../../../../common/model.js";
import { InlineSuggestionGutterMenuData, SimpleInlineSuggestModel } from "../../components/gutterIndicatorView.js";
import { InlineEditTabAction } from "../../inlineEditsViewInterface.js";
import { TextModelValueReference } from "../../../../model/textModelValueReference.js";
export interface ILongDistancePreviewProps {
    nextCursorPosition: Position | null;
    diff: DetailedLineRangeMapping[];
    model: SimpleInlineSuggestModel;
    inlineSuggestInfo: InlineSuggestionGutterMenuData;
    /**
     * The URI of the file the edit targets.
     * When undefined (or same as the editor's model URI), the edit targets the current file.
     */
    target: TextModelValueReference;
}
export declare class LongDistancePreviewEditor extends Disposable {
    private readonly _previewTextModel;
    private readonly _properties;
    private readonly _parentEditor;
    private readonly _tabAction;
    private readonly _instantiationService;
    readonly previewEditor: EmbeddedCodeEditorWidget;
    private readonly _previewEditorObs;
    private readonly _previewRef;
    readonly element: import("../../../../../../../../base/browser/dom.js").ObserverNode<HTMLDivElement>;
    private _parentEditorObs;
    constructor(_previewTextModel: ITextModel, _properties: IObservable<ILongDistancePreviewProps | undefined>, _parentEditor: ICodeEditor, _tabAction: IObservable<InlineEditTabAction>, _instantiationService: IInstantiationService);
    private readonly _state;
    private _createPreviewEditor;
    readonly updatePreviewEditorEffect: import("../../../../../../../../base/common/observable.js").IObservableWithChange<void, void>;
    readonly horizontalContentRangeInPreviewEditorToShow: import("../../../../../../../../base/common/observable.js").IObservableWithChange<{
        indentationEnd: number;
        preferredRangeToReveal: OffsetRange;
        maxEditorWidth: number;
        contentWidth: number;
        nonContentWidth: number;
    } | undefined, void>;
    readonly contentHeight: IObservable<number | null>;
    private _getHorizontalContentRangeInPreviewEditorToShow;
    layout(dimension: IDimension, desiredPreviewEditorScrollLeft: number): void;
    private readonly _editorDecorations;
}
