import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { IChatRequestVariableEntry } from "../../common/attachments/chatVariableEntries.js";
import { ChatAttachmentWidgetFactory, IChatAttachmentWidgetInstance } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/browser/attachments/chatAttachmentWidgetRegistry";
export declare const IChatAttachmentWidgetRegistry: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatAttachmentWidgetRegistry>;
export interface IChatAttachmentWidgetRegistry {
    readonly _serviceBrand: undefined;
    /**
    * Register a widget factory for a specific attachment kind.
    */
    registerFactory(kind: string, factory: ChatAttachmentWidgetFactory): IDisposable;
    /**
    * Try to create a widget for the given attachment using a registered factory.
    * Returns undefined if no factory is registered for the attachment's kind.
    */
    createWidget(attachment: IChatRequestVariableEntry, options: {
        shouldFocusClearButton: boolean;
        supportsDeletion: boolean;
    }, container: HTMLElement): IChatAttachmentWidgetInstance | undefined;
}
