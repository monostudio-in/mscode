import { Event } from "../../../../base/common/event.js";
export declare const IOnboardingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IOnboardingService>;
export interface IOnboardingService {
    readonly _serviceBrand: undefined;
    /**
    * Fires when the onboarding modal is dismissed.
    */
    readonly onDidDismiss: Event<void>;
    /**
    * Show the onboarding modal.
    */
    show(): void;
}
