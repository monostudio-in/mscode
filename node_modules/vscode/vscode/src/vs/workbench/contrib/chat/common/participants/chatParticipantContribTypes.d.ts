import { ChatModeKind, RawChatParticipantLocation } from "../constants.js";
export interface IRawChatCommandContribution {
    name: string;
    description: string;
    sampleRequest?: string;
    isSticky?: boolean;
    when?: string;
    disambiguation?: {
        category: string;
        categoryName?: string /** Deprecated */;
        description: string;
        examples: string[];
    }[];
}
export interface IRawChatParticipantContribution {
    id: string;
    name: string;
    fullName: string;
    when?: string;
    description?: string;
    isDefault?: boolean;
    isSticky?: boolean;
    sampleRequest?: string;
    commands?: IRawChatCommandContribution[];
    locations?: RawChatParticipantLocation[];
    /**
     * Valid for default participants in 'panel' location
     */
    modes?: ChatModeKind[];
    disambiguation?: {
        category: string;
        categoryName?: string /** Deprecated */;
        description: string;
        examples: string[];
    }[];
}
/**
 * Hardcoding the previous id of the Copilot Chat provider to avoid breaking view locations, persisted data, etc.
 * DON'T use this for any new data, only for old persisted data.
 * @deprecated
 */
export declare const CHAT_PROVIDER_ID = "copilot";
