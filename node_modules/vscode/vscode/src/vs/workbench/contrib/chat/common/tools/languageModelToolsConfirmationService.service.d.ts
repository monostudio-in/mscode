import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { ILanguageModelToolConfirmationActionProducer, ILanguageModelToolConfirmationContribution } from "./languageModelToolsConfirmationService.js";
import { IToolData } from "./languageModelToolsService.js";
/**
* Handles language model tool confirmation.
*
* - By default, all tools can have their confirmation preferences saved within
*   a session, workspace, or globally.
* - Tools with ToolDataSource from an extension or MCP can have that entire
*   source's preference saved within a session, workspace, or globally.
* - Contributable confirmations may also be registered for specific behaviors.
*
* Note: this interface MUST NOT depend in the ILanguageModelToolsService.
* The ILanguageModelToolsService depends on this service instead in order to
* call getPreConfirmAction/getPostConfirmAction.
*/
export interface ILanguageModelToolsConfirmationService extends ILanguageModelToolConfirmationActionProducer {
    readonly _serviceBrand: undefined;
    /** Opens an IQuickTree to let the user manage their preferences.  */
    manageConfirmationPreferences(tools: readonly IToolData[], options?: {
        defaultScope?: "workspace" | "profile" | "session";
        focusToolId?: string;
    }): void;
    /**
    * Registers a contribution that provides more specific confirmation logic
    * for a tool, in addition to the default confirmation handling.
    */
    registerConfirmationContribution(toolName: string, contribution: ILanguageModelToolConfirmationContribution): IDisposable;
    /**
    * Returns true if the tool has confirmation that can be managed, either
    * because it has {@link IToolData.canRequestPreApproval} or
    * {@link IToolData.canRequestPostApproval} set, because a
    * {@link ILanguageModelToolConfirmationContribution} is registered for it,
    * or because it has stored auto-confirmation settings.
    */
    toolCanManageConfirmation(tool: IToolData): boolean;
    /** Resets all tool and server confirmation preferences */
    resetToolAutoConfirmation(): void;
}
export declare const ILanguageModelToolsConfirmationService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageModelToolsConfirmationService>;
