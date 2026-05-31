/**
 * List of safe, non-input html tags.
 */
export declare const basicMarkupHtmlTags: readonly string[];
export declare const defaultAllowedAttrs: readonly string[];
/**
 * Predicate that checks if an attribute should be kept or removed.
 *
 * @returns A boolean indicating whether the attribute should be kept or a string with the sanitized value (which implicitly keeps the attribute)
 */
export type SanitizeAttributePredicate = (node: Element, data: {
    readonly attrName: string;
    readonly attrValue: string;
}) => boolean | string;
export interface SanitizeAttributeRule {
    readonly attributeName: string;
    shouldKeep: SanitizeAttributePredicate;
}
export interface DomSanitizerConfig {
    /**
     * Configured the allowed html tags.
     */
    readonly allowedTags?: {
        readonly override?: readonly string[];
        readonly augment?: readonly string[];
    };
    /**
     * Configured the allowed html attributes.
     */
    readonly allowedAttributes?: {
        readonly override?: ReadonlyArray<string | SanitizeAttributeRule>;
        readonly augment?: ReadonlyArray<string | SanitizeAttributeRule>;
    };
    /**
     * List of allowed protocols for `href` attributes.
     */
    readonly allowedLinkProtocols?: {
        readonly override?: readonly string[] | "*";
    };
    /**
     * If set, allows relative paths for links.
     */
    readonly allowRelativeLinkPaths?: boolean;
    /**
     * List of allowed protocols for `src` attributes.
     */
    readonly allowedMediaProtocols?: {
        readonly override?: readonly string[] | "*";
    };
    /**
     * If set, allows relative paths for media (images, videos, etc).
     */
    readonly allowRelativeMediaPaths?: boolean;
    /**
     * If set, replaces unsupported tags with their plaintext representation instead of removing them.
     *
     * For example, <p><bad>"text"</bad></p> becomes <p>"<bad>text</bad>"</p>.
     */
    readonly replaceWithPlaintext?: boolean;
}
/**
 * Sanitizes an html string.
 *
 * @param untrusted The HTML string to sanitize.
 * @param config Optional configuration for sanitization. If not provided, defaults to a safe configuration.
 *
 * @returns A sanitized string of html.
 */
export declare function sanitizeHtml(untrusted: string, config?: DomSanitizerConfig): TrustedHTML;
export declare function convertTagToPlaintext(node: Node): DocumentFragment | undefined;
/**
 * Sanitizes the given `value` and reset the given `node` with it.
 */
export declare function safeSetInnerHtml(node: HTMLElement, untrusted: string, config?: DomSanitizerConfig): void;
