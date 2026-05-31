import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { ChatModel } from "../model/chatModel.js";
import { IChatEditingSession, IChatEditingSessionProvider } from "./chatEditingService.js";
export declare const IChatEditingService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatEditingService>;
export interface IChatEditingService {
    _serviceBrand: undefined;
    startOrContinueGlobalEditingSession(chatModel: ChatModel): IChatEditingSession;
    getEditingSession(chatSessionResource: URI): IChatEditingSession | undefined;
    /**
    * All editing sessions, sorted by recency, e.g the last created session comes first.
    */
    readonly editingSessionsObs: IObservable<readonly IChatEditingSession[]>;
    /**
    * Creates a new short lived editing session
    */
    createEditingSession(chatModel: ChatModel): IChatEditingSession;
    /**
    * Creates an editing session with state transferred from the provided session.
    */
    transferEditingSession(chatModel: ChatModel, session: IChatEditingSession): IChatEditingSession;
    /**
    * Registers a provider that creates editing sessions for chat sessions
    * with the given URI scheme. When {@link createEditingSession} is called
    * for a chat model whose sessionResource matches the scheme, the provider
    * is used instead of the default implementation.
    */
    registerEditingSessionProvider(scheme: string, provider: IChatEditingSessionProvider): IDisposable;
}
