import { Event } from "../../../../../base/common/event.js";
import { URI } from "../../../../../base/common/uri.js";
import { IAgentSessionsModel, IAgentSession } from "./agentSessionsModel.js";
export declare const IAgentSessionsService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentSessionsService>;
export interface IAgentSessionsService {
    readonly _serviceBrand: undefined;
    readonly model: IAgentSessionsModel;
    readonly onDidChangeSessionArchivedState: Event<IAgentSession>;
    getSession(resource: URI): IAgentSession | undefined;
}
