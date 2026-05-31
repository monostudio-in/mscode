import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../base/common/observable.js";
import { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { MergeEditorViewModel } from "@codingame/monaco-vscode-view-common-service-override/vscode/vs/workbench/contrib/mergeEditor/browser/view/viewModel";
export declare const conflictMarkers: {
    start: string;
    end: string;
};
export declare class MergeMarkersController extends Disposable {
    readonly editor: ICodeEditor;
    readonly mergeEditorViewModel: IObservable<MergeEditorViewModel | undefined>;
    private readonly viewZoneIds;
    private readonly disposableStore;
    constructor(editor: ICodeEditor, mergeEditorViewModel: IObservable<MergeEditorViewModel | undefined>);
    private updateDecorations;
}
