import { IExtensionGalleryManifest } from "../../../../platform/extensionManagement/common/extensionGalleryManifest.js";
export declare class Query {
    value: string;
    sortBy: string;
    constructor(value: string, sortBy: string);
    static suggestions(query: string, galleryManifest: IExtensionGalleryManifest | null): string[];
    static parse(value: string): Query;
    toString(): string;
    isValid(): boolean;
    equals(other: Query): boolean;
}
