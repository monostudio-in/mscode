import { URI } from "../../../../base/common/uri.js";
import { LanguageSelector } from "../../../../editor/common/languageSelector.js";
import { LineRangeMapping } from "../../../../editor/common/diff/rangeMapping.js";
import { IChange } from "../../../../editor/common/diff/legacyLinesDiffComputer.js";
import { IColorTheme } from "../../../../platform/theme/common/themeService.js";
import { Color } from "../../../../base/common/color.js";
export declare const minimapGutterModifiedBackground: string;
export declare const minimapGutterAddedBackground: string;
export declare const minimapGutterDeletedBackground: string;
export declare const overviewRulerModifiedForeground: string;
export declare const overviewRulerAddedForeground: string;
export declare const overviewRulerDeletedForeground: string;
export declare const editorGutterItemGlyphForeground: string;
export declare const editorGutterItemBackground: string;
type QuickDiffProviderKind = "primary" | "secondary" | "contributed";
export interface QuickDiffProvider {
    readonly id: string;
    readonly label: string;
    readonly rootUri: URI | undefined;
    readonly selector?: LanguageSelector;
    readonly kind: QuickDiffProviderKind;
    getOriginalResource(uri: URI): Promise<URI | null>;
}
export interface QuickDiff {
    readonly id: string;
    readonly label: string;
    readonly originalResource: URI;
    readonly kind: QuickDiffProviderKind;
}
export interface QuickDiffChange {
    readonly providerId: string;
    readonly original: URI;
    readonly modified: URI;
    readonly change: IChange;
    readonly change2: LineRangeMapping;
}
export interface QuickDiffResult {
    readonly providerId: string;
    readonly providerKind: QuickDiffProviderKind;
    readonly original: URI;
    readonly modified: URI;
    readonly changes: IChange[];
    readonly changes2: LineRangeMapping[];
}
export declare enum ChangeType {
    Modify = 0,
    Add = 1,
    Delete = 2
}
export declare function getChangeType(change: IChange): ChangeType;
export declare function getChangeTypeColor(theme: IColorTheme, changeType: ChangeType): Color | undefined;
export declare function compareChanges(a: IChange, b: IChange): number;
export declare function getChangeHeight(change: IChange): number;
export declare function getModifiedEndLineNumber(change: IChange): number;
export declare function lineIntersectsChange(lineNumber: number, change: IChange): boolean;
export {};
