import { Event } from "../../../../base/common/event.js";
import { IScopedRendererMessaging } from "./notebookRendererMessagingService.js";
export declare const INotebookRendererMessagingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookRendererMessagingService>;
export interface INotebookRendererMessagingService {
    readonly _serviceBrand: undefined;
    /**
    * Event that fires when a message should be posted to extension hosts.
    */
    readonly onShouldPostMessage: Event<{
        editorId: string;
        rendererId: string;
        message: unknown;
    }>;
    /**
    * Prepares messaging for the given renderer ID.
    */
    prepare(rendererId: string): void;
    /**
    * Gets messaging scoped for a specific editor.
    */
    getScoped(editorId: string): IScopedRendererMessaging;
    /**
    * Called when the main thread gets a message for a renderer.
    */
    receiveMessage(editorId: string | undefined, rendererId: string, message: unknown): Promise<boolean>;
}
