import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IReadonlyVSDataTransfer } from "../../../../base/common/dataTransfer.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import { IPosition } from "../../../common/core/position.js";
import { IRange } from "../../../common/core/range.js";
import { DocumentDropEditProvider, DocumentDropEditsSession, DocumentPasteContext, DocumentPasteEdit, DocumentPasteEditProvider, DocumentPasteEditsSession } from "../../../common/languages.js";
import { ITextModel } from "../../../common/model.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.service.js";
declare abstract class SimplePasteAndDropProvider implements DocumentDropEditProvider, DocumentPasteEditProvider {
    readonly kind: HierarchicalKind;
    readonly providedDropEditKinds: HierarchicalKind[];
    readonly providedPasteEditKinds: HierarchicalKind[];
    abstract readonly dropMimeTypes: readonly string[] | undefined;
    readonly copyMimeTypes: never[];
    abstract readonly pasteMimeTypes: readonly string[];
    constructor(kind: HierarchicalKind);
    provideDocumentPasteEdits(_model: ITextModel, _ranges: readonly IRange[], dataTransfer: IReadonlyVSDataTransfer, context: DocumentPasteContext, token: CancellationToken): Promise<DocumentPasteEditsSession | undefined>;
    provideDocumentDropEdits(_model: ITextModel, _position: IPosition, dataTransfer: IReadonlyVSDataTransfer, token: CancellationToken): Promise<DocumentDropEditsSession | undefined>;
    protected abstract getEdit(dataTransfer: IReadonlyVSDataTransfer, token: CancellationToken): Promise<DocumentPasteEdit | undefined>;
}
export declare class DefaultTextPasteOrDropEditProvider extends SimplePasteAndDropProvider {
    static readonly id = "text";
    readonly id = "text";
    readonly dropMimeTypes: "text/plain"[];
    readonly pasteMimeTypes: "text/plain"[];
    constructor();
    protected getEdit(dataTransfer: IReadonlyVSDataTransfer, _token: CancellationToken): Promise<DocumentPasteEdit | undefined>;
}
export declare class DefaultDropProvidersFeature extends Disposable {
    constructor(languageFeaturesService: ILanguageFeaturesService, workspaceContextService: IWorkspaceContextService);
}
export declare class DefaultPasteProvidersFeature extends Disposable {
    constructor(languageFeaturesService: ILanguageFeaturesService, workspaceContextService: IWorkspaceContextService);
}
export {};
