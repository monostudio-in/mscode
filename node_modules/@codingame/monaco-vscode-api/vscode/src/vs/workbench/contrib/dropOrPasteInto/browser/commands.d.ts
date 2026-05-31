import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.service.js";
export declare class DropOrPasteIntoCommands implements IWorkbenchContribution {
    private readonly _preferencesService;
    static ID: string;
    constructor(_preferencesService: IPreferencesService);
    private configurePreferredPasteAction;
    private configurePreferredDropAction;
}
