import { Event } from "../../../base/common/event.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { ExtHostDocumentsShape, IMainContext } from "./extHost.protocol.js";
import { ExtHostDocumentData } from "./extHostDocumentData.js";
import { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import type * as vscode from "vscode";
import { ISerializedModelContentChangedEvent } from "../../../editor/common/textModelEvents.js";
export declare class ExtHostDocuments implements ExtHostDocumentsShape {
    private readonly _toDispose;
    private readonly _onDidAddDocument;
    private readonly _onDidRemoveDocument;
    private readonly _onDidChangeDocument;
    private readonly _onDidChangeDocumentWithReason;
    private readonly _onDidSaveDocument;
    readonly onDidAddDocument: Event<vscode.TextDocument>;
    readonly onDidRemoveDocument: Event<vscode.TextDocument>;
    readonly onDidChangeDocument: Event<vscode.TextDocumentChangeEvent>;
    readonly onDidChangeDocumentWithReason: Event<vscode.TextDocumentChangeEvent>;
    readonly onDidSaveDocument: Event<vscode.TextDocument>;
    private _proxy;
    private _documentsAndEditors;
    private _documentLoader;
    constructor(mainContext: IMainContext, documentsAndEditors: ExtHostDocumentsAndEditors);
    dispose(): void;
    getAllDocumentData(): ExtHostDocumentData[];
    getDocumentData(resource: vscode.Uri): ExtHostDocumentData | undefined;
    getDocument(resource: vscode.Uri): vscode.TextDocument;
    ensureDocumentData(uri: URI, options?: {
        encoding?: string;
    }): Promise<ExtHostDocumentData>;
    createDocumentData(options?: {
        language?: string;
        content?: string;
        encoding?: string;
    }): Promise<URI>;
    $acceptModelLanguageChanged(uriComponents: UriComponents, newLanguageId: string): void;
    $acceptModelSaved(uriComponents: UriComponents): void;
    $acceptDirtyStateChanged(uriComponents: UriComponents, isDirty: boolean): void;
    $acceptEncodingChanged(uriComponents: UriComponents, encoding: string): void;
    $acceptModelChanged(uriComponents: UriComponents, events: ISerializedModelContentChangedEvent, isDirty: boolean): void;
    setWordDefinitionFor(languageId: string, wordDefinition: RegExp | undefined): void;
}
