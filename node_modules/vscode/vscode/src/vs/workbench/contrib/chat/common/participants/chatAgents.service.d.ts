import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Event } from "../../../../../base/common/event.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { IChatFollowup, IChatProgress } from "../chatService/chatService.js";
import { ChatAgentLocation, ChatModeKind } from "../constants.js";
import { IChatAgent, IChatAgentCommand, IChatAgentCompletionItem, IChatAgentData, IChatAgentHistoryEntry, IChatAgentImplementation, IChatAgentInvocationEvent, IChatAgentMetadata, IChatAgentRequest, IChatAgentResult, IChatParticipantDetectionProvider, UserSelectedTools } from "./chatAgents.js";
export declare const IChatAgentService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatAgentService>;
export interface IChatAgentService {
    _serviceBrand: undefined;
    /**
    * undefined when an agent was removed
    */
    readonly onDidChangeAgents: Event<IChatAgent | undefined>;
    readonly onWillInvokeAgent: Event<IChatAgentInvocationEvent>;
    readonly hasToolsAgent: boolean;
    registerAgent(id: string, data: IChatAgentData): IDisposable;
    registerAgentImplementation(id: string, agent: IChatAgentImplementation): IDisposable;
    registerDynamicAgent(data: IChatAgentData, agentImpl: IChatAgentImplementation): IDisposable;
    registerAgentCompletionProvider(id: string, provider: (query: string, token: CancellationToken) => Promise<IChatAgentCompletionItem[]>): IDisposable;
    getAgentCompletionItems(id: string, query: string, token: CancellationToken): Promise<IChatAgentCompletionItem[]>;
    registerChatParticipantDetectionProvider(handle: number, provider: IChatParticipantDetectionProvider): IDisposable;
    detectAgentOrCommand(request: IChatAgentRequest, history: IChatAgentHistoryEntry[], options: {
        location: ChatAgentLocation;
    }, token: CancellationToken): Promise<{
        agent: IChatAgentData;
        command?: IChatAgentCommand;
    } | undefined>;
    hasChatParticipantDetectionProviders(): boolean;
    invokeAgent(agent: string, request: IChatAgentRequest, progress: (parts: IChatProgress[]) => void, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatAgentResult>;
    setRequestTools(agent: string, requestId: string, tools: UserSelectedTools): void;
    setYieldRequested(agent: string, requestId: string, value: boolean): void;
    getFollowups(id: string, request: IChatAgentRequest, result: IChatAgentResult, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatFollowup[]>;
    getChatTitle(id: string, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<string | undefined>;
    getChatSummary(id: string, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<string | undefined>;
    getAgent(id: string, includeDisabled?: boolean): IChatAgentData | undefined;
    getAgentByFullyQualifiedId(id: string): IChatAgentData | undefined;
    getAgents(): IChatAgentData[];
    getActivatedAgents(): Array<IChatAgent>;
    getAgentsByName(name: string): IChatAgentData[];
    agentHasDupeName(id: string): boolean;
    /**
    * Get the default agent (only if activated)
    */
    getDefaultAgent(location: ChatAgentLocation, mode?: ChatModeKind): IChatAgent | undefined;
    /**
    * Get the default agent data that has been contributed (may not be activated yet)
    */
    getContributedDefaultAgent(location: ChatAgentLocation): IChatAgentData | undefined;
    updateAgent(id: string, updateMetadata: IChatAgentMetadata): void;
}
export declare const IChatAgentNameService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatAgentNameService>;
export interface IChatAgentNameService {
    _serviceBrand: undefined;
    getAgentNameRestriction(chatAgentData: IChatAgentData): boolean;
}
