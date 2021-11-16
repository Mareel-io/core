import { AxiosInstance } from "axios";
import { GenericProfileManager, GenericUserGroupProfile } from "../generic/ProfileManager";

export class FortiProfileManager extends GenericProfileManager {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    public async getAvailableProfiles(): Promise<string[]> {
        return ['usergroup'];
    }

    public createUserGroupProfile(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public getUserGroupProfile(id?: string): Promise<GenericUserGroupProfile> {
        throw new Error("Method not implemented.");
    }
    public removeUserGroupProfile(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}