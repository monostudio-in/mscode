import { IProductConfiguration } from "../../../base/common/product.js";
/**
 * @deprecated It is preferred that you use `IProductService` if you can. This
 * allows web embedders to override our defaults. But for things like `product.quality`,
 * the use is fine because that property is not overridable.
 */
declare let product: IProductConfiguration;
export default product;
