import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IQuickPickItem } from "../../quickinput/common/quickInput.js";
import { IGalleryExtension } from "../../extensionManagement/common/extensionManagement.js";
import { IExtensionGalleryService } from "../../extensionManagement/common/extensionManagement.service.js";
import { ILanguagePackService } from "./languagePacks.service.js";
export declare function getLocale(extension: IGalleryExtension): string | undefined;
export interface ILanguagePackItem extends IQuickPickItem {
    readonly extensionId?: string;
    readonly galleryExtension?: IGalleryExtension;
}
export declare abstract class LanguagePackBaseService extends Disposable implements ILanguagePackService {
    protected readonly extensionGalleryService: IExtensionGalleryService;
    readonly _serviceBrand: undefined;
    constructor(extensionGalleryService: IExtensionGalleryService);
    abstract getBuiltInExtensionTranslationsUri(id: string, language: string): Promise<URI | undefined>;
    abstract getInstalledLanguages(): Promise<Array<ILanguagePackItem>>;
    getAvailableLanguages(): Promise<ILanguagePackItem[]>;
    protected createQuickPickItem(locale: string, languageName?: string, languagePack?: IGalleryExtension): IQuickPickItem;
}
