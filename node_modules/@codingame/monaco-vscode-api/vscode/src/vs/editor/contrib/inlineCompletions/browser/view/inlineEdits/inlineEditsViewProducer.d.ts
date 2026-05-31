import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor } from "../../../../../browser/editorBrowser.js";
import { InlineCompletionsModel } from "../../model/inlineCompletionsModel.js";
import { ModelPerInlineEdit } from "./inlineEditsModel.js";
import { InlineEditsView } from "./inlineEditsView.js";
export declare class InlineEditsViewAndDiffProducer extends Disposable {
    private readonly _editor;
    private readonly _model;
    private readonly _showCollapsed;
    private readonly _editorObs;
    private readonly _inlineEdit;
    readonly _inlineEditModel: import("../../../../../../base/common/observable.js").IObservableWithChange<ModelPerInlineEdit | undefined, void>;
    readonly view: InlineEditsView;
    constructor(_editor: ICodeEditor, _model: IObservable<InlineCompletionsModel | undefined>, _showCollapsed: IObservable<boolean>, instantiationService: IInstantiationService);
}
