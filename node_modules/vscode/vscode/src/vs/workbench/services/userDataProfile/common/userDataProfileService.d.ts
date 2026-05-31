import { Disposable } from "../../../../base/common/lifecycle.js";
import { IUserDataProfile } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { DidChangeUserDataProfileEvent } from "./userDataProfile.js";
import { IUserDataProfileService } from "./userDataProfile.service.js";
export declare class UserDataProfileService extends Disposable implements IUserDataProfileService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeCurrentProfile;
    readonly onDidChangeCurrentProfile: import("../../../../base/common/event.js").Event<DidChangeUserDataProfileEvent>;
    private _currentProfile;
    get currentProfile(): IUserDataProfile;
    constructor(currentProfile: IUserDataProfile);
    updateCurrentProfile(userDataProfile: IUserDataProfile): Promise<void>;
}
