import { URI } from "../../../base/common/uri.js";
/**
 * Helper for creating and parsing browser view URIs.
 */
export declare namespace BrowserViewUri {
    const scheme = "vscode-browser";
    /**
     * Creates a resource URI for a browser view with the given ID.
     */
    function forId(id: string): URI;
    /**
     * Parses a browser view resource URI to extract the ID.
     */
    function parse(resource: URI): {
        id: string;
    } | undefined;
    /**
     * Extracts the ID from a browser view resource URI.
     */
    function getId(resource: URI): string | undefined;
}
