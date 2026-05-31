import * as asn1js from "asn1js";
import { isBufferSource, toArrayBuffer, } from "@peculiar/utils/bytes";
import { AsnParser } from "./parser.js";
import { AsnSerializer } from "./serializer.js";
export class AsnConvert {
    static serialize(obj) {
        return AsnSerializer.serialize(obj);
    }
    static parse(data, target) {
        return AsnParser.parse(data, target);
    }
    static toString(data) {
        const buf = isBufferSource(data)
            ? toArrayBuffer(data)
            : AsnConvert.serialize(data);
        const asn = asn1js.fromBER(buf);
        if (asn.offset === -1) {
            throw new Error(`Cannot decode ASN.1 data. ${asn.result.error}`);
        }
        return asn.result.toString();
    }
}
