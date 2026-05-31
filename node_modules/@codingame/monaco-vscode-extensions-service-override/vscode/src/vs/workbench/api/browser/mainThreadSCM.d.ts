import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { InputValidationType } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/scm/common/scm";
import { ISCMViewService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/scm/common/scm.service";
import { ISCMService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/scm/common/scm.service";
import { MainThreadSCMShape, SCMProviderFeatures, SCMRawResourceSplices, SCMGroupFeatures, SCMHistoryItemRefsChangeEventDto, SCMHistoryItemRefDto } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ThemeIcon } from "@codingame/monaco-vscode-api/vscode/vs/base/common/themables";
import { IMarkdownString } from "@codingame/monaco-vscode-api/vscode/vs/base/common/htmlContent";
import { IQuickDiffService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/scm/common/quickDiff.service";
import { IUriIdentityService } from "@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service";
import { IWorkspaceContextService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service";
import { ILanguageService } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/languages/language.service";
import { IModelService } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/services/model.service";
import { ITextModelService } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/services/resolverService.service";
export declare class MainThreadSCM implements MainThreadSCMShape {
    private readonly scmService;
    private readonly scmViewService;
    private readonly languageService;
    private readonly modelService;
    private readonly textModelService;
    private readonly quickDiffService;
    private readonly _uriIdentService;
    private readonly workspaceContextService;
    private readonly _proxy;
    private _repositories;
    private _repositoryBarriers;
    private _repositoryDisposables;
    private readonly _disposables;
    constructor(extHostContext: IExtHostContext, scmService: ISCMService, scmViewService: ISCMViewService, languageService: ILanguageService, modelService: IModelService, textModelService: ITextModelService, quickDiffService: IQuickDiffService, _uriIdentService: IUriIdentityService, workspaceContextService: IWorkspaceContextService);
    dispose(): void;
    $registerSourceControl(handle: number, parentHandle: number | undefined, id: string, label: string, rootUri: UriComponents | undefined, iconPath: UriComponents | {
        light: UriComponents;
        dark: UriComponents;
    } | ThemeIcon | undefined, isHidden: boolean | undefined, inputBoxDocumentUri: UriComponents): Promise<void>;
    $updateSourceControl(handle: number, features: SCMProviderFeatures): Promise<void>;
    $unregisterSourceControl(handle: number): Promise<void>;
    $registerGroups(sourceControlHandle: number, groups: [
        number,
        string,
        string,
        SCMGroupFeatures, /* multiDiffEditorEnableViewChanges */
        boolean
    ][], splices: SCMRawResourceSplices[]): Promise<void>;
    $updateGroup(sourceControlHandle: number, groupHandle: number, features: SCMGroupFeatures): Promise<void>;
    $updateGroupLabel(sourceControlHandle: number, groupHandle: number, label: string): Promise<void>;
    $spliceResourceStates(sourceControlHandle: number, splices: SCMRawResourceSplices[]): Promise<void>;
    $unregisterGroup(sourceControlHandle: number, handle: number): Promise<void>;
    $setInputBoxValue(sourceControlHandle: number, value: string): Promise<void>;
    $setInputBoxPlaceholder(sourceControlHandle: number, placeholder: string): Promise<void>;
    $setInputBoxEnablement(sourceControlHandle: number, enabled: boolean): Promise<void>;
    $setInputBoxVisibility(sourceControlHandle: number, visible: boolean): Promise<void>;
    $showValidationMessage(sourceControlHandle: number, message: string | IMarkdownString, type: InputValidationType): Promise<void>;
    $setValidationProviderIsEnabled(sourceControlHandle: number, enabled: boolean): Promise<void>;
    $onDidChangeHistoryProviderCurrentHistoryItemRefs(sourceControlHandle: number, historyItemRef?: SCMHistoryItemRefDto, historyItemRemoteRef?: SCMHistoryItemRefDto, historyItemBaseRef?: SCMHistoryItemRefDto): Promise<void>;
    $onDidChangeHistoryProviderHistoryItemRefs(sourceControlHandle: number, historyItemRefs: SCMHistoryItemRefsChangeEventDto): Promise<void>;
    $onDidChangeArtifacts(sourceControlHandle: number, groups: string[]): Promise<void>;
}
