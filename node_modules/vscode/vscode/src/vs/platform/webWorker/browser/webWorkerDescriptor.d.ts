import { URI } from "../../../base/common/uri.js";
export declare class WebWorkerDescriptor {
    readonly esmModuleLocation: URI | (() => URI) | undefined;
    readonly esmModuleLocationBundler: URL | (() => URL) | undefined;
    readonly label: string;
    constructor(args: {
        /** The location of the esm module after transpilation */
        esmModuleLocation?: URI | (() => URI);
        /** The location of the esm module when used in a bundler environment. Refer to the typescript file in the src folder and use `?esm`. */
        esmModuleLocationBundler?: URL | (() => URL);
        label: string;
    });
}
