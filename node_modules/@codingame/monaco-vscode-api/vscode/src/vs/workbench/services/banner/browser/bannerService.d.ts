import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { URI } from "../../../../base/common/uri.js";
import { ILinkDescriptor } from "../../../../platform/opener/browser/link.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
export interface IBannerItem {
    readonly id: string;
    readonly icon: ThemeIcon | URI | undefined;
    readonly message: string | MarkdownString;
    readonly actions?: ReadonlyArray<ILinkDescriptor>;
    readonly ariaLabel?: string;
    readonly onClose?: () => void;
    readonly closeLabel?: string;
}
