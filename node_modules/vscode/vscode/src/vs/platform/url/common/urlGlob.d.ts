import { URI } from "../../../base/common/uri.js";
/**
 * Checks if a given URL matches a glob URL pattern.
 * The glob URL pattern can contain wildcards (*) and subdomain matching (*.)
 * @param uri The URL to check.
 * @param globUrl The glob URL pattern to match against.
 * @returns boolean - True if the URL matches the glob URL pattern, false otherwise.
 */
export declare function testUrlMatchesGlob(uri: string | URI, globUrl: string): boolean;
