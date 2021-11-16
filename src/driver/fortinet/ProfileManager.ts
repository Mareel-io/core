import { AxiosInstance } from "axios";
import { GenericProfileManager, GenericUserGroupProfile } from "../generic/ProfileManager";
import { FortigateUserGroup } from "./util/types";
 
export class FortiProfileManager extends GenericProfileManager {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    public async getAvailableProfiles(): Promise<string[]> {
        return ['usergroup'];
    }

    public async createUserGroupProfile(profile: GenericUserGroupProfile): Promise<void> {
        if (profile.members == null) {
            profile.members = [];
        }

        if (profile.guests == null){
            profile.guests = [];
        }

        const payload: FortigateUserGroup = {
            name: profile.name,
            'group-type': 'firewall',
            member: profile.members.map((elem) => {
                return {
                    name: elem.ref,
                };
            }),
            guest: profile.guests.map((elem) => {
                return {
                    name: elem.ref,
                };
            }),
        };

        await this.api.post('/api/v2/cmdb/user/group', payload);
    }

    public async getUserGroupProfiles(id?: string): Promise<GenericUserGroupProfile[]> {
        const res = await this.api.get('/api/v2/cmdb/user/group');
        const fortiUsers: FortigateUserGroup[] = res.data.results;

        return fortiUsers.map((elem): GenericUserGroupProfile => {
            return {
                id: elem.q_origin_key!,
                name: elem.name!,
                members: elem.member.map((userElement): {ref: string} => {
                    return {
                        ref: userElement.name,
                    };
                }),
                guests: elem.guest.map((userElement): {ref: string} => {
                    return {
                        ref: userElement.name,
                    }
                }),
            }
        });
    }

    public async removeUserGroupProfile(id: string): Promise<void> {
        await this.api.delete(`/api/v2/cmdb/user/group/${id}`);
    }
}
