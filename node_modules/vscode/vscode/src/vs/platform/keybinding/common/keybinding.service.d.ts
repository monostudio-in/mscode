import { Event } from "../../../base/common/event.js";
import { Keybinding, ResolvedKeybinding } from "../../../base/common/keybindings.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { IContextKeyServiceTarget } from "../../contextkey/common/contextkey.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.service.js";
import { IKeyboardEvent, KeybindingsSchemaContribution } from "./keybinding.js";
import { ResolutionResult } from "./keybindingResolver.js";
import { ResolvedKeybindingItem } from "./resolvedKeybindingItem.js";
export declare const IKeybindingService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IKeybindingService>;
export interface IKeybindingService {
    readonly _serviceBrand: undefined;
    readonly inChordMode: boolean;
    readonly onDidUpdateKeybindings: Event<void>;
    registerContainer(container: HTMLElement): IDisposable;
    /**
    * Returns none, one or many (depending on keyboard layout)!
    */
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveUserBinding(userBinding: string): ResolvedKeybinding[];
    /**
    * Resolve and dispatch `keyboardEvent` and invoke the command.
    */
    dispatchEvent(e: IKeyboardEvent, target: IContextKeyServiceTarget): boolean;
    /**
    * Resolve and dispatch `keyboardEvent`, but do not invoke the command or change inner state.
    */
    softDispatch(keyboardEvent: IKeyboardEvent, target: IContextKeyServiceTarget): ResolutionResult;
    /**
    * Enable hold mode for this command. This is only possible if the command is current being dispatched, meaning
    * we are after its keydown and before is keyup event.
    *
    * @returns A promise that resolves when hold stops, returns undefined if hold mode could not be enabled.
    */
    enableKeybindingHoldMode(commandId: string): Promise<void> | undefined;
    dispatchByUserSettingsLabel(userSettingsLabel: string, target: IContextKeyServiceTarget): void;
    /**
    * Look up keybindings for a command.
    * Use `lookupKeybinding` if you are interested in the preferred keybinding.
    */
    lookupKeybindings(commandId: string): ResolvedKeybinding[];
    /**
    * Look up the preferred (last defined) keybinding for a command.
    * @returns The preferred keybinding or null if the command is not bound.
    */
    lookupKeybinding(commandId: string, context?: IContextKeyService, enforceContextCheck?: boolean): ResolvedKeybinding | undefined;
    getDefaultKeybindingsContent(): string;
    getDefaultKeybindings(): readonly ResolvedKeybindingItem[];
    getKeybindings(): readonly ResolvedKeybindingItem[];
    customKeybindingsCount(): number;
    /**
    * Will the given key event produce a character that's rendered on screen, e.g. in a
    * text box. *Note* that the results of this function can be incorrect.
    */
    mightProducePrintableCharacter(event: IKeyboardEvent): boolean;
    registerSchemaContribution(contribution: KeybindingsSchemaContribution): IDisposable;
    toggleLogging(): boolean;
    /**
    * Given a UI element label and a command ID, appends the keybinding label if any.
    * If the command is defined and has a keybinding, returns `${label} (keybinding label)`, otherwise just `label`.
    */
    appendKeybinding(label: string, commandId: string | undefined | null, context?: IContextKeyService, enforceContextCheck?: boolean): string;
    _dumpDebugInfo(): string;
    _dumpDebugInfoJSON(): string;
}
