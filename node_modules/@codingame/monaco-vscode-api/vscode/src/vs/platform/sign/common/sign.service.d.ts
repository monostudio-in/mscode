import { type IMessage } from "./sign.js";
export declare const ISignService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ISignService>;
export interface ISignService {
    readonly _serviceBrand: undefined;
    createNewMessage(value: string): Promise<IMessage>;
    validate(message: IMessage, value: string): Promise<boolean>;
    sign(value: string): Promise<string>;
}
