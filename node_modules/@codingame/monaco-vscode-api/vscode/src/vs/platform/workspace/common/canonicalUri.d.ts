import { CancellationToken } from "../../../base/common/cancellation.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
export interface ICanonicalUriProvider {
    readonly scheme: string;
    provideCanonicalUri(uri: UriComponents, targetScheme: string, token: CancellationToken): Promise<URI | undefined>;
}
