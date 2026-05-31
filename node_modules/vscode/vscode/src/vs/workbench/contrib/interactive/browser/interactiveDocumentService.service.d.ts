import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
export declare const IInteractiveDocumentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IInteractiveDocumentService>;
export interface IInteractiveDocumentService {
    readonly _serviceBrand: undefined;
    readonly onWillAddInteractiveDocument: Event<{
        notebookUri: URI;
        inputUri: URI;
        languageId: string;
    }>;
    readonly onWillRemoveInteractiveDocument: Event<{
        notebookUri: URI;
        inputUri: URI;
    }>;
    willCreateInteractiveDocument(notebookUri: URI, inputUri: URI, languageId: string): void;
    willRemoveInteractiveDocument(notebookUri: URI, inputUri: URI): void;
}
