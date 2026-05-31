import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { PreferredGroup } from "../../../services/editor/common/editorService.js";
import { IChatElicitationRequest } from "../common/chatService/chatService.js";
import { ChatAgentLocation } from "../common/constants.js";
import { IChatResponseViewModel } from "../common/model/chatViewModel.js";
import { IChatWidget, ChatViewPaneTarget, type IQuickChatOpenOptions, type ICodeBlockActionContextProvider } from "./chat.js";
import { ChatWidget } from "@codingame/monaco-vscode-katex-common/vscode/vs/workbench/contrib/chat/browser/widget/chatWidget";
import { IChatEditorOptions } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/browser/widgetHosts/editor/chatEditor";
export declare const IChatWidgetService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatWidgetService>;
export interface IChatWidgetService {
    readonly _serviceBrand: undefined;
    /**
    * Returns the most recently focused widget if any.
    *
    * ⚠️ Consider carefully if this is appropriate for your use case. If you
    * can know what session you're interacting with, prefer {@link getWidgetBySessionResource}
    * or similar methods to work nicely with multiple chat widgets.
    */
    readonly lastFocusedWidget: IChatWidget | undefined;
    readonly onDidAddWidget: Event<IChatWidget>;
    /**
    * Fires when a chat session is no longer open in any chat widget.
    */
    readonly onDidBackgroundSession: Event<URI>;
    /**
    * Fires when the focused chat widget changes.
    */
    readonly onDidChangeFocusedWidget: Event<IChatWidget | undefined>;
    /**
    * Fires when the focused chat session changes, either because the focused widget
    * changed or because the focused widget loaded a different session.
    */
    readonly onDidChangeFocusedSession: Event<void>;
    /**
    * Reveals the widget, focusing its input unless `preserveFocus` is true.
    */
    reveal(widget: IChatWidget, preserveFocus?: boolean): Promise<boolean>;
    /**
    * Reveals the last active widget, or creates a new chat if necessary.
    */
    revealWidget(preserveFocus?: boolean): Promise<IChatWidget | undefined>;
    getAllWidgets(): ReadonlyArray<IChatWidget>;
    getWidgetByInputUri(uri: URI): IChatWidget | undefined;
    openSession(sessionResource: URI, target?: typeof ChatViewPaneTarget, options?: IChatEditorOptions): Promise<IChatWidget | undefined>;
    openSession(sessionResource: URI, target?: PreferredGroup, options?: IChatEditorOptions): Promise<IChatWidget | undefined>;
    openSession(sessionResource: URI, target?: typeof ChatViewPaneTarget | PreferredGroup, options?: IChatEditorOptions): Promise<IChatWidget | undefined>;
    getWidgetBySessionResource(sessionResource: URI): IChatWidget | undefined;
    getWidgetsByLocations(location: ChatAgentLocation): ReadonlyArray<IChatWidget>;
    /**
    * An IChatWidget registers itself when created.
    */
    register(newWidget: IChatWidget): IDisposable;
}
export declare const IQuickChatService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IQuickChatService>;
export interface IQuickChatService {
    readonly _serviceBrand: undefined;
    readonly onDidClose: Event<void>;
    readonly enabled: boolean;
    readonly focused: boolean;
    /** Defined when quick chat is open */
    readonly sessionResource?: URI;
    toggle(options?: IQuickChatOpenOptions): void;
    focus(): void;
    open(options?: IQuickChatOpenOptions): void;
    close(): void;
    openInChatView(): void;
}
export declare const IChatAccessibilityService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatAccessibilityService>;
export interface IChatAccessibilityService {
    readonly _serviceBrand: undefined;
    acceptRequest(uri: URI, skipRequestSignal?: boolean): void;
    disposeRequest(requestId: URI): void;
    acceptResponse(widget: ChatWidget, container: HTMLElement, response: IChatResponseViewModel | string | undefined, requestId: URI | undefined, isVoiceInput?: boolean): void;
    acceptElicitation(message: IChatElicitationRequest): void;
}
export declare const IChatCodeBlockContextProviderService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatCodeBlockContextProviderService>;
export interface IChatCodeBlockContextProviderService {
    readonly _serviceBrand: undefined;
    readonly providers: ICodeBlockActionContextProvider[];
    registerProvider(provider: ICodeBlockActionContextProvider, id: string): IDisposable;
}
