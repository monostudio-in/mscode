import { ExtensionRecommendations, ExtensionRecommendation } from "./extensionRecommendations.js";
import { IProductService } from "../../../../platform/product/common/productService.service.js";
import { IExtensionManagementServerService } from "../../../services/extensionManagement/common/extensionManagement.service.js";
export declare class WebRecommendations extends ExtensionRecommendations {
    private readonly productService;
    private readonly extensionManagementServerService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    constructor(productService: IProductService, extensionManagementServerService: IExtensionManagementServerService);
    protected doActivate(): Promise<void>;
}
