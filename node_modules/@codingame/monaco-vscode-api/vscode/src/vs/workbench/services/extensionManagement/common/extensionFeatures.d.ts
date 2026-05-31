import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { Event } from "../../../../base/common/event.js";
import { IExtensionManifest } from "../../../../platform/extensions/common/extensions.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import Severity from "../../../../base/common/severity.js";
import { IStringDictionary } from "../../../../base/common/collections.js";
import { ResolvedKeybinding } from "../../../../base/common/keybindings.js";
import { Color } from "../../../../base/common/color.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
export declare namespace Extensions {
    const ExtensionFeaturesRegistry = "workbench.registry.extensionFeatures";
}
export interface IExtensionFeatureRenderer extends IDisposable {
    type: string;
    shouldRender(manifest: IExtensionManifest): boolean;
    render(manifest: IExtensionManifest): IDisposable;
}
export interface IRenderedData<T> extends IDisposable {
    readonly data: T;
    readonly onDidChange?: Event<T>;
}
export interface IExtensionFeatureMarkdownRenderer extends IExtensionFeatureRenderer {
    type: "markdown";
    render(manifest: IExtensionManifest): IRenderedData<IMarkdownString>;
}
export type IRowData = string | IMarkdownString | ResolvedKeybinding | Color | ReadonlyArray<ResolvedKeybinding | IMarkdownString | Color>;
export interface ITableData {
    headers: string[];
    rows: IRowData[][];
}
export interface IExtensionFeatureTableRenderer extends IExtensionFeatureRenderer {
    type: "table";
    render(manifest: IExtensionManifest): IRenderedData<ITableData>;
}
export interface IExtensionFeatureMarkdownAndTableRenderer extends IExtensionFeatureRenderer {
    type: "markdown+table";
    render(manifest: IExtensionManifest): IRenderedData<Array<IMarkdownString | ITableData>>;
}
export interface IExtensionFeatureDescriptor {
    readonly id: string;
    readonly label: string;
    readonly accessDataLabel?: string;
    readonly description?: string;
    readonly icon?: ThemeIcon;
    readonly access: {
        readonly canToggle?: boolean;
        readonly requireUserConsent?: boolean;
        readonly extensionsList?: IStringDictionary<boolean>;
    };
    readonly renderer?: SyncDescriptor<IExtensionFeatureRenderer>;
}
export interface IExtensionFeaturesRegistry {
    registerExtensionFeature(descriptor: IExtensionFeatureDescriptor): IDisposable;
    getExtensionFeature(id: string): IExtensionFeatureDescriptor | undefined;
    getExtensionFeatures(): ReadonlyArray<IExtensionFeatureDescriptor>;
}
export interface IExtensionFeatureAccessData {
    readonly current?: {
        readonly accessTimes: Date[];
        readonly lastAccessed: Date;
        readonly status?: {
            readonly severity: Severity;
            readonly message: string;
        };
    };
    readonly accessTimes: Date[];
}
