import { CancellationToken } from "../../../../base/common/cancellation.js";
import { URI } from "../../../../base/common/uri.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { LanguageSelector } from "../../../../editor/common/languageSelector.js";
export interface IShareableItem {
    resourceUri: URI;
    selection?: Selection;
}
export interface IShareProvider {
    readonly id: string;
    readonly label: string;
    readonly priority: number;
    readonly selector: LanguageSelector;
    prepareShare?(item: IShareableItem, token: CancellationToken): Thenable<boolean | undefined>;
    provideShare(item: IShareableItem, token: CancellationToken): Thenable<URI | string | undefined>;
}
