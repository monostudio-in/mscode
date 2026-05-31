import { BreadcrumbsWidget } from "../../../../base/browser/ui/breadcrumbs/breadcrumbsWidget.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { GroupIdentifier } from "../../../common/editor.js";
export declare const IBreadcrumbsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBreadcrumbsService>;
export interface IBreadcrumbsService {
    readonly _serviceBrand: undefined;
    register(group: GroupIdentifier, widget: BreadcrumbsWidget): IDisposable;
    getWidget(group: GroupIdentifier): BreadcrumbsWidget | undefined;
}
