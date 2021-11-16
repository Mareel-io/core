export interface GenericUserGroupProfile {
    id: string,
    name: string,
    radiusServerId: string;
}

export abstract class GenericProfileManager {
    public abstract getAvailableProfiles(): Promise<string[]>;
    public abstract createUserGroupProfile(): Promise<void>;
    public abstract getUserGroupProfile(id?: string): Promise<GenericUserGroupProfile>;
    public abstract removeUserGroupProfile(id: string): Promise<void>;
}