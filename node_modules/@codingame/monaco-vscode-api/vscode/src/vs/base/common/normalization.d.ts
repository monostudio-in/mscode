export declare function normalizeNFC(str: string): string;
export declare function normalizeNFD(str: string): string;
/**
 * Attempts to normalize the string to Unicode base format (NFD -> remove accents -> lower case).
 * When original string contains accent characters directly, only lower casing will be performed.
 * This is done so as to keep the string length the same and not affect indices.
 *
 * @see https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
 */
export declare const tryNormalizeToBase: (str: string) => string;
