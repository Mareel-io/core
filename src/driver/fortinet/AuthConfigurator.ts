import { AxiosInstance } from "axios";
import { EmitFlags } from "typescript";
import { UnsupportedFeatureError } from "../../error/MarilError";
import { GenericAuthConfigurator } from "../generic/AuthConfigurator";
import { RADIUSAuthMethod, RADIUS } from "../generic/RADIUS";
import { FortigateElement, FortigateRADIUS } from "./util/types";

interface RadiusServers {
    servers: RADIUS[],
    method: RADIUSAuthMethod,
}

export class AuthConfigurator extends GenericAuthConfigurator {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    public async getRADIUSServers(): Promise<{id: string, servers: RADIUS[], authMethod: RADIUSAuthMethod}[]> {
        const res = await this.api.get('/api/v2/cmdb/user/radius');
        const radiusServers: FortigateRADIUS[] = res.data.results;

        return radiusServers.map((elem) => {
            const servers: RADIUS[] = [];
            servers.push({
                server: elem.server,
                key: elem.secret,
            });

            if (elem['secondary-server'] != null) {
                servers.push({
                    server: elem['secondary-server'],
                    key: elem['secondary-secret'],
                });
            }

            if (elem['tertiary-server'] != null) {
                servers.push({
                    server: elem['tertiary-server'],
                    key: elem['tertiary-secret'],
                });
            }

            const authMethod: RADIUSAuthMethod = ((): RADIUSAuthMethod => {
                switch (elem['auth-type']) {
                    case 'pap':
                    case 'chap':
                        return {
                            method: elem['auth-type'],
                        };
                    case 'ms_chap':
                        return {
                            method: 'mschap',
                        };
                    case 'ms_chap_v2':
                        return {
                            method: 'mschapv2',
                        };
                    default:
                        throw new Error(`Unknown auth method:${elem['auth-type']}`);
                }
            })();

            return {
                id: elem.q_origin_key,
                servers: servers,
                authMethod: authMethod,
            }
        });
    }

    public async addRADIUSServer(name: string, method: RADIUSAuthMethod, servers: RADIUS[]) {
        // TODO: Sanitize name
        const radiusServer01 = servers[0];
        const radiusServer02 = servers[1] != null ? servers[1] : {
            server: '',
            key: '',
        };
        const radiusServer03 = servers[2] != null ? servers[2] : {
            server: '',
            key: '',
        };

        if (method.tunnel != null) {
            throw new Error('Tunnel method is not allowed.');
        }

        const authMethod = ((): 'chap' | 'ms_chap' | 'ms_chap_v2' | 'pap' => {
            switch(method.method) {
                case 'pap':
                case 'chap':
                    return method.method;
                case 'mschap':
                    return 'ms_chap';
                case 'mschapv2':
                    return 'ms_chap_v2';
                default:
                    throw new UnsupportedFeatureError(`Unsupported auth method: ${method.method}`);
            }
        })();

        const fortigateRADIUS: FortigateRADIUS = {
            name: name,
            "q_origin_key": name,
            "server": radiusServer01.server,
            "secret": radiusServer01.key,
            "secondary-server": radiusServer02.server,
            "secondary-secret": radiusServer02.key,
            "tertiary-server": radiusServer03.server,
            "tertiary-secret": radiusServer03.key,
            "timeout": 5,
            "all-usergroup": "disable",
            "use-management-vdom": "disable",
            "nas-ip": "0.0.0.0",
            "acct-interim-interval": 0,
            "radius-coa": "disable",
            "radius-port": 0,
            "h3c-compatibility": "disable",
            "auth-type": authMethod,
            "source-ip": "",
            "username-case-sensitive": "disable",
            "group-override-attr-type": "",
            "class": [
            ],
            "password-renewal": "enable",
            "password-encoding": "auto",
            "acct-all-servers": "disable",
            "switch-controller-acct-fast-framedip-detect": 2,
            "interface-select-method": "auto",
            "interface": "",
            "switch-controller-service-type": "",
            "rsso": "disable",
            "rsso-radius-server-port": 1813,
            "rsso-radius-response": "disable",
            "rsso-validate-request-secret": "disable",
            "rsso-secret": "",
            "rsso-endpoint-attribute": "Calling-Station-Id",
            "rsso-endpoint-block-attribute": "",
            "sso-attribute": "Class",
            "sso-attribute-key": "",
            "sso-attribute-value-override": "enable",
            "rsso-context-timeout": 28800,
            "rsso-log-period": 0,
            "rsso-log-flags":"protocol-error profile-missing accounting-stop-missed accounting-event endpoint-block radiusd-other",
            "rsso-flush-ip-session":"disable",
            "rsso-ep-one-ip-only":"disable",
            "accounting-server":[
            ],
        };

        await this.api.post(`/api/v2/cmdb/user/radius`, fortigateRADIUS);
    }

    public async deleteRADIUSServer(id: string) {
        await this.api.delete(`/api/v2/cmdb/user/radius/${id}`);
    }
}
