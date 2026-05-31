import { type BufferSourceLike } from "@peculiar/utils/bytes";
import { IEmptyConstructor } from "./types";
export declare class AsnConvert {
    static serialize(obj: unknown): ArrayBuffer;
    static parse<T>(data: BufferSourceLike, target: IEmptyConstructor<T>): T;
    /**
     * Returns a string representation of an ASN.1 encoded data
     * @param data ASN.1 encoded buffer source
     * @returns String representation of ASN.1 structure
     */
    static toString(data: BufferSourceLike): string;
    /**
     * Returns a string representation of an ASN.1 schema
     * @param obj Object which can be serialized to ASN.1 schema
     * @returns String representation of ASN.1 structure
     */
    static toString(obj: unknown): string;
}
