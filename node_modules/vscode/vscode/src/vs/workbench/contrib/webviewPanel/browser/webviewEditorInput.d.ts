import { CodeWindow } from "../../../../base/browser/window.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { EditorInputCapabilities, GroupIdentifier, IUntypedEditorInput, Verbosity } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IOverlayWebview } from "../../webview/browser/webview.js";
export interface WebviewInputInitInfo {
    readonly viewType: string;
    readonly providedId: string | undefined;
    readonly name: string;
    readonly iconPath: WebviewIconPath | undefined;
}
export declare class WebviewInput extends EditorInput {
    private readonly _themeService;
    static typeId: string;
    get typeId(): string;
    get editorId(): string;
    get capabilities(): EditorInputCapabilities;
    private readonly _resourceId;
    private _webviewTitle;
    private _iconPath?;
    private _group?;
    private _webview;
    private _hasTransfered;
    get resource(): URI;
    readonly viewType: string;
    readonly providerId: string | undefined;
    constructor(init: WebviewInputInitInfo, webview: IOverlayWebview, _themeService: IThemeService);
    dispose(): void;
    getName(): string;
    getTitle(_verbosity?: Verbosity): string;
    getDescription(): string | undefined;
    setWebviewTitle(value: string): void;
    getWebviewTitle(): string | undefined;
    get webview(): IOverlayWebview;
    get extension(): import("../../webview/browser/webview.js").WebviewExtensionDescription | undefined;
    getIcon(): URI | ThemeIcon | undefined;
    get iconPath(): WebviewIconPath | undefined;
    set iconPath(value: WebviewIconPath | undefined);
    matches(other: EditorInput | IUntypedEditorInput): boolean;
    get group(): GroupIdentifier | undefined;
    updateGroup(group: GroupIdentifier): void;
    protected transfer(other: WebviewInput): WebviewInput | undefined;
    claim(claimant: unknown, targetWindow: CodeWindow, scopedContextKeyService: IContextKeyService | undefined): void;
}
export type WebviewIconPath = ThemeIcon | {
    readonly light: URI;
    readonly dark: URI;
};
