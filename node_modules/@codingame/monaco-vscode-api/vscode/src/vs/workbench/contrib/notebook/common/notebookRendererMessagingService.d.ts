import { IDisposable } from "../../../../base/common/lifecycle.js";
export interface IScopedRendererMessaging extends IDisposable {
    /**
     * Method called when a message is received. Should return a boolean
     * indicating whether a renderer received it.
     */
    receiveMessageHandler?: (rendererId: string, message: unknown) => Promise<boolean>;
    /**
     * Sends a message to an extension from a renderer.
     */
    postMessage(rendererId: string, message: unknown): void;
}
