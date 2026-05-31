import { Event } from "../../../../base/common/event.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IChatTip } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/browser/chatTipService";
export declare const IChatTipService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatTipService>;
export interface IChatTipService {
    readonly _serviceBrand: undefined;
    /**
    * Fired when the current tip is dismissed.
    */
    readonly onDidDismissTip: Event<void>;
    /**
    * Fired when the user navigates to a different tip (previous/next).
    */
    readonly onDidNavigateTip: Event<IChatTip>;
    /**
    * Fired when the tip widget is hidden without dismissing the tip.
    */
    readonly onDidHideTip: Event<void>;
    /**
    * Fired when tips are disabled.
    */
    readonly onDidDisableTips: Event<void>;
    /**
    * Gets a tip to show on the welcome/getting-started view.
    * Returns the same tip on repeated calls for stable rerenders.
    */
    getWelcomeTip(contextKeyService: IContextKeyService): IChatTip | undefined;
    /**
    * Resets tip state for a new conversation.
    * Call this when the chat widget binds to a new model.
    */
    resetSession(): void;
    /**
    * Dismisses the current tip and allows a new one to be picked for the same request.
    * The dismissed tip will not be shown again for this user on this application installation.
    */
    dismissTip(): void;
    /**
    * Dismisses the current tip and hides all tips for the rest of the current chat session.
    */
    dismissTipForSession(): void;
    /**
    * Hides the tip widget without permanently dismissing the tip.
    * The tip may be shown again in a future session.
    */
    hideTip(): void;
    /**
    * Hides all tips for the rest of the current chat session.
    */
    hideTipsForSession(): void;
    /**
    * Disables tips permanently by setting the `chat.tips.enabled` configuration to false.
    */
    disableTips(): Promise<void>;
    /**
    * Navigates to the next tip in the catalog without permanently dismissing the current one.
    */
    navigateToNextTip(): IChatTip | undefined;
    /**
    * Navigates to the previous tip in the catalog without permanently dismissing the current one.
    */
    navigateToPreviousTip(): IChatTip | undefined;
    /**
    * Gets the next eligible tip after the current one, without requiring multiple tips.
    * Used after dismissing a tip to show the next available tip (even if it's the only one left).
    */
    getNextEligibleTip(): IChatTip | undefined;
    /**
    * Returns whether there are multiple eligible tips for navigation.
    */
    hasMultipleTips(): boolean;
    /**
    * Records usage of a slash command to update tip eligibility for flows where
    * the slash command text is transformed before request submission.
    */
    recordSlashCommandUsage(command: string): void;
    /**
    * Clears all dismissed tips so they can be shown again.
    */
    clearDismissedTips(): void;
}
