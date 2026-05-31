import { ITextModel } from "../../../../../../editor/common/model.js";
import { ISequenceValue } from "../promptFileParser.js";
export declare function formatArrayValue(name: string, quotePreference?: QuotePreference): string;
export type QuotePreference = "'" | "\"" | "";
export declare function getQuotePreference(arrayValue: ISequenceValue, model: ITextModel): QuotePreference;
