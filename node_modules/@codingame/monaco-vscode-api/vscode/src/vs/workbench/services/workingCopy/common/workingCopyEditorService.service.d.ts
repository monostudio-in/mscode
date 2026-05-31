import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IEditorIdentifier } from "../../../common/editor.js";
import { IWorkingCopy } from "./workingCopy.js";
import { IWorkingCopyEditorHandler } from "@codingame/monaco-vscode-working-copy-service-override/vscode/vs/workbench/services/workingCopy/common/workingCopyEditorService";
export declare const IWorkingCopyEditorService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkingCopyEditorService>;
export interface IWorkingCopyEditorService {
    readonly _serviceBrand: undefined;
    /**
    * An event fired whenever a handler is registered.
    */
    readonly onDidRegisterHandler: Event<IWorkingCopyEditorHandler>;
    /**
    * Register a handler to the working copy editor service.
    */
    registerHandler(handler: IWorkingCopyEditorHandler): IDisposable;
    /**
    * Finds the first editor that can handle the provided working copy.
    */
    findEditor(workingCopy: IWorkingCopy): IEditorIdentifier | undefined;
}
