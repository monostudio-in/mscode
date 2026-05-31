import { CancellationToken } from "../../../../base/common/cancellation.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { IPosition, Position } from "../../../common/core/position.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { Rejection, RenameLocation, RenameProvider, WorkspaceEdit } from "../../../common/languages.js";
import { ITextModel } from "../../../common/model.js";
export declare function hasProvider(registry: LanguageFeatureRegistry<RenameProvider>, model: ITextModel): boolean;
export declare function prepareRename(registry: LanguageFeatureRegistry<RenameProvider>, model: ITextModel, position: Position, cancellationToken?: CancellationToken): Promise<RenameLocation & Rejection | undefined>;
export declare function rawRename(registry: LanguageFeatureRegistry<RenameProvider>, model: ITextModel, position: Position, newName: string, cancellationToken?: CancellationToken): Promise<WorkspaceEdit & Rejection>;
export declare function rename(registry: LanguageFeatureRegistry<RenameProvider>, model: ITextModel, position: Position, newName: string): Promise<WorkspaceEdit & Rejection>;
export declare class RenameAction extends EditorAction {
    constructor();
    runCommand(accessor: ServicesAccessor, args: [
        URI,
        IPosition
    ]): void | Promise<void>;
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
