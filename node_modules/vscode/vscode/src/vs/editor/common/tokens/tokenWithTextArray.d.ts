import { OffsetRange } from "../core/ranges/offsetRange.js";
import { ILanguageIdCodec } from "../languages.js";
import { LineTokens } from "./lineTokens.js";
/**
 * This class represents a sequence of tokens.
 * Conceptually, each token has a length and a metadata number.
 * A token array might be used to annotate a string with metadata.
 * Use {@link TokenWithTextArrayBuilder} to efficiently create a token array.
 *
 * TODO: Make this class more efficient (e.g. by using a Int32Array).
*/
export declare class TokenWithTextArray {
    private readonly _tokenInfo;
    static fromLineTokens(lineTokens: LineTokens): TokenWithTextArray;
    static create(tokenInfo: TokenWithTextInfo[]): TokenWithTextArray;
    private constructor();
    toLineTokens(decoder: ILanguageIdCodec): LineTokens;
    forEach(cb: (range: OffsetRange, tokenInfo: TokenWithTextInfo) => void): void;
    map<T>(cb: (range: OffsetRange, tokenInfo: TokenWithTextInfo) => T): T[];
    slice(range: OffsetRange): TokenWithTextArray;
    append(other: TokenWithTextArray): TokenWithTextArray;
}
export type TokenMetadata = number;
export declare class TokenWithTextInfo {
    readonly text: string;
    readonly metadata: TokenMetadata;
    constructor(text: string, metadata: TokenMetadata);
}
/**
 * TODO: Make this class more efficient (e.g. by using a Int32Array).
*/
export declare class TokenWithTextArrayBuilder {
    private readonly _tokens;
    add(text: string, metadata: TokenMetadata): void;
    build(): TokenWithTextArray;
}
