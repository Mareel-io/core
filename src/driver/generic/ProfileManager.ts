export interface GenericUserGroupProfile {
    id: string,
    name: string,
    members?: {
        ref: string,
    }[],
    guests?: {
        ref: string
    }[],
}

export abstract class GenericProfileManager {
    public abstract getAvailableProfiles(): Promise<string[]>;
    public abstract createUserGroupProfile(profile: GenericUserGroupProfile): Promise<void>;
    public abstract getUserGroupProfiles(id?: string): Promise<GenericUserGroupProfile[]>;
    public abstract removeUserGroupProfile(id: string): Promise<void>;
}
