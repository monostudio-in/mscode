import { IObservable, IReader } from "../../../../base/common/observable.js";
export declare const ITreeSitterThemeService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITreeSitterThemeService>;
export interface ITreeSitterThemeService {
    readonly _serviceBrand: undefined;
    readonly onChange: IObservable<void>;
    findMetadata(captureNames: string[], languageId: number, bracket: boolean, reader: IReader | undefined): number;
}
