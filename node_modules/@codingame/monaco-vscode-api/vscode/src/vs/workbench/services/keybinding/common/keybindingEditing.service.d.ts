import { ResolvedKeybindingItem } from "../../../../platform/keybinding/common/resolvedKeybindingItem.js";
export declare const IKeybindingEditingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IKeybindingEditingService>;
export interface IKeybindingEditingService {
    readonly _serviceBrand: undefined;
    addKeybinding(keybindingItem: ResolvedKeybindingItem, key: string, when: string | undefined): Promise<void>;
    editKeybinding(keybindingItem: ResolvedKeybindingItem, key: string, when: string | undefined): Promise<void>;
    removeKeybinding(keybindingItem: ResolvedKeybindingItem): Promise<void>;
    resetKeybinding(keybindingItem: ResolvedKeybindingItem): Promise<void>;
}
