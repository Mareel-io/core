import { StringMappingType } from "typescript";

export interface FortigateElement {
    name?: string,
    q_origin_key: string,
}

export interface FortigateIDElement {
    id?: number,
    q_origin_key: number,
}

export interface FortiOSLog {
    date: string,
    time: string,
    eventtime: string,
    tz: string,
    logid: string,
    type: string,
    subtype: string,
    level: string,
    vd: string,
    logdesc: string,
    action: string,
    cpu: number,
    mem: number,
    totalsession: number,
    disk: number,
    bandwidth: string,
    setuprate: number,
    disklograte: number,
    gbazlograte: number,
    freediskstorage: number,
    sysuptime: number,
    waninfo: string,
    msg: string,
    _metadata: {
        "#": string,
        logid: number,
        timestamp: number,
        roll: number
    }
}

export interface FortigateAuthRule extends FortigateIDElement {
    "source-interface": FortigateElement[],
    "source-address": FortigateElement[],
    "source-address-negate": 'enable' | 'disable',
    "source-address6": FortigateElement[],
    "source-address6-negate": 'enable' | 'disable',
    "users": FortigateElement[], 
    "groups": FortigateElement[],
    "portal": string,
    "realm": string,
    "client-cert": 'enable' | 'disable',
    "user-peer": string,
    "cipher": string, // High?
    "auth": string,
}

export interface FortiSSLVPN {
    status: 'enable' | 'disable',
    reqclientcert: 'enable' | 'disable',
    'user-peer': string,
    'ssl-max-proto-ver'?: 'tls1-0' | 'tls1-1' | 'tls1-2' | 'tls1-3',
    'ssl-min-proto-ver'?: 'tls1-0' | 'tls1-1' | 'tls1-2' | 'tls1-3',
    'banned-cipher'?: string, // Typical OpenSSL cipher description
    ciphersuite?: string, // Typical OpenSSL cipher description
    'ssl-insert-empty-fragment': 'enable' | 'disable',
    'https-redirect': 'enable' | 'disable',
    'x-content-type-options': 'enable' | 'disable',
    'ssl-client-renegotiation': 'enable' | 'disable',
    'force-two-factor-auth': 'disable' | 'enable',
    'unsafe-legacy-renegotiation': 'disable' | 'enable',
    servercert: string,
    algorithm: string,
    'idle-timeout': number,
    'auth-timeout': number,
    'login-attempt-limit': number,
    'login-block-time': number,
    'login-timeout': number,
    'dtls-hello-timeout': number,
    'tunnel-ip-pools': FortigateElement[],
    'tunnel-ipv6-pools': FortigateElement[],
    'dns-suffix': string,
    'dns-server1': string,
    'dns-server2': string,
    'wins-server1': string,
    'wins-server2': string,
    'ipv6-dns-server1': string,
    'ipv6-dns-server2': string,
    'ipv6-wins-server1': string,
    'ipv6-wins-server2': string,
    'url-obfuscation': 'enable' | 'disable',
    'http-compression': 'enable' | 'disable',
    'http-only-cookie': 'enable' | 'disable',
    'deflate-compression-level': number,
    'deflate-min-data-size': number,
    port: number,
    'port-precedence': 'enable' | 'disable',
    'auto-tunnel-static-cookie': 'enable' | 'disable',
    'header-x-forwarded-for': string, // add ?
    'source-interface': FortigateElement[],
    'source-address': FortigateElement[],
    'source-address-negate': 'enable' | 'disable',
    'source-address6': FortigateElement[],
    'source-address6-negate': 'enable' | 'disable',
    'default-portal': string,
    'authentication-rule': FortigateAuthRule[],
    'dtls-tunnel': 'enable' | 'disable',
    'dlts-max-proto-ver': 'dtls1-0' | 'dtls1-1' | 'dtls1-2' | 'dtls1-3',
    'dlts-min-proto-ver': 'dtls1-0' | 'dtls1-1' | 'dtls1-2' | 'dtls1-3',
    'check-referer': 'enable' | 'disable',
    'http-request-header-timeout': number,
    'http-request-body-timeout': number,
    'auth-session-check-source-ip': 'enable' | 'disable',
    'tunnel-connect-without-reauth': 'enable' | 'disable',
    'tunnel-user-session-timeout': number,
    'hsts-include-subdomains': 'enable' | 'disable',
    'transform-backward-slashes': 'enable' | 'disable',
    'encode-2f-sequence': 'enable' | 'disable',
    'encrypt-and-store-password': 'enable' | 'disable',
    'client-sigalgs':'all',
    'dual-stack-mode': 'enable' | 'disable',
    'tunnel-addr-assigned-method': string,
    'saml-redirect-port': number,
}

export interface FortigateShaper extends FortigateElement {
    "guaranteed-bandwidth": number | null,
    "maximum-bandwidth": number | null,
    "bandwidth-unit": 'kbps',
    priority: 'low' | 'medium' | 'high',
    "per-policy": 'enable' | 'disable' | null,
    diffserv: 'enable' | 'disable',
    diffservcode: string | null, // DSCP bitmask
    'dscp-marking-method': string,
    'exceed-bandwidth': number,
    'exceed-dscp': string, // DSCP bitmask
    'maximum-dscp': string, // DSCP bitmask
    overhead: number,
    'exceed-class-id': number,
}

export interface FortigateShapingPolicy extends FortigateElement {
    id?: number,
    comment: string,
    status: 'enable' | 'disable',
    "ip-version": '4' | '6',
    "srcaddr": FortigateElement[],
    "dstaddr": FortigateElement[],
    "srcaddr6": FortigateElement[],
    "dstaddr6": FortigateElement[],
    "internet-service": 'enable' | 'disable',
    "internet-service-name": [],
    "internet-service-group": [],
    "internet-service-custom": [],
    "internet-service-custom-group": [],
    "internet-service-src": "disable",
    "internet-service-src-name": [],
    "internet-service-src-group": [],
    "internet-service-src-custom": [],
    "internet-service-src-custom-group": [],
    "service": {name: string, q_origin_key: string}[],
    "schedule": string, // I don't know about it yet
    "users": [],
    "groups": [],
    "application": [],
    "app-category": [],
    "app-group": [],
    "url-category": [],
    "srcintf": FortigateElement[],
    "dstintf": FortigateElement[],
    "tos": "0x00",
    "tos-mask": "0x00",
    "tos-negate": 'enable' | 'disable',
    "traffic-shaper": string,
    "traffic-shaper-reverse": string,
    "per-ip-shaper": "",
    "class-id": 0,
    "diffserv-forward": 'enable' | 'disable',
    "diffserv-reverse": 'enable' | 'disable',
    "diffservcode-forward": string,
    "diffservcode-rev": string
}

export interface FortigateRADIUS extends FortigateElement {
    server: string,
    secret: string,
    "secondary-server": string,
    "secondary-secret": string,
    "tertiary-server": string,
    "tertiary-secret": string,
    timeout: number,
    "all-usergroup": 'enable' | 'disable',
    "use-management-vdom": 'enable' | 'disable',
    "nas-ip": string,
    "acct-interim-interval": number,
    "radius-coa": 'enable' | 'disable',
    "radius-port": number,
    "h3c-compatibility": 'enable' | 'disable',
    "auth-type": 'chap' | 'ms_chap' | 'ms_chap_v2' | 'pap',
    "source-ip": string,
    "username-case-sensitive": 'enable' | 'disable',
    "group-override-attr-type": string,
    class:[
    ],
    "password-renewal": 'enable' | 'disable',
    "password-encoding": 'auto', // TODO: FIXME
    "acct-all-servers":"disable",
    "switch-controller-acct-fast-framedip-detect":2,
    "interface-select-method":"auto",
    interface: string,
    "switch-controller-service-type": string,
    rsso: 'enable' | 'disable',
    "rsso-radius-server-port":1813,
    "rsso-radius-response": 'enable' | 'disable',
    "rsso-validate-request-secret": 'enable' | 'disable',
    "rsso-secret": string,
    "rsso-endpoint-attribute": string,
    "rsso-endpoint-block-attribute": string,
    "sso-attribute": string,
    "sso-attribute-key": string,
    "sso-attribute-value-override": 'enable' | 'disable',
    "rsso-context-timeout": number,
    "rsso-log-period": number,
    "rsso-log-flags": string,
    "rsso-flush-ip-session": 'enable' | 'disable',
    "rsso-ep-one-ip-only": 'enable' | 'disable',
    "accounting-server":[
    ]
}

export interface FortigateRoute {
    "seq-num"?: number,
    "q_origin_key"?: number,
    "status": 'enable' | 'disable',
    "dst": string,
    "src": string,
    "gateway": string,
    "distance": number,
    "weight": number,
    "priority": number,
    "device": string,
    "comment": string,
    "blackhole": 'enable' | 'disable',
    "dynamic-gateway": 'enable' | 'disable',
    "sdwan-zone":[
    ],
    "dstaddr": string,
    "internet-service": number,
    "internet-service-custom": string,
    "link-monitor-exempt": 'enable' | 'disable',
    "vrf": number,
    "bfd": 'enable' | 'disable',
}

export interface FortigateFirewall {
    "policyid"?: number,
    "q_origin_key"?: number,
    "status": 'enable' | 'disable',
    "name": string,
    "uuid"?: string,
    "uuid-idx"?: number,
    "srcintf": FortigateElement[],
    "dstintf": FortigateElement[],
    "action": 'accept' | 'deny',
    "nat64": 'enable' | 'disable',
    "nat46": 'enable' | 'disable',
    "srcaddr"?: FortigateElement[],
    "dstaddr"?: FortigateElement[],
    "srcaddr6"?: FortigateElement[],
    "dstaddr6"?: FortigateElement[],
    "service": FortigateElement[],
    "ztna-status"?: 'enable' | 'disable',
    "ztna-ems-tag"?:[
    ],
    "ztna-geo-tag"?:[
    ],
    "internet-service"?: 'enable' | 'disable',
    "internet-service-name"?:[
    ],
    "internet-service-group"?:[
    ],
    "internet-service-custom"?:[
    ],
    "internet-service-custom-group"?:[
    ],
    "internet-service-src"?: 'enable' | 'disable',
    "internet-service-src-name"?:[
    ],
    "internet-service-src-group"?:[
    ],
    "internet-service-src-custom"?:[
    ],
    "internet-service-src-custom-group"?:[
    ],
    "reputation-minimum"?:0,
    "reputation-direction"?:"destination",
    "src-vendor-mac"?:[
    ],
    "rtp-nat"?: 'enable' | 'disable',
    "rtp-addr"?:[
    ],
    "send-deny-packet"?: 'enable' | 'disable',
    "firewall-session-dirty"?:"check-all",
    "schedule"?: 'always',
    "schedule-timeout"?: 'enable' | 'disable',
    "tos"?: string,
    "tos-mask"?: string,
    "tos-negate"?: 'enable' | 'disable',
    "anti-replay"?: 'enable' | 'disable',
    "tcp-session-without-syn"?: 'enable' | 'disable',
    "geoip-anycast"?: 'enable' | 'disable',
    "geoip-match"?:"physical-location",
    "dynamic-shaping"?: 'enable' | 'disable',
    "passive-wan-health-measurement"?: 'enable' | 'disable',
    "utm-status"?: 'enable' | 'disable',
    "inspection-mode"?: string,
    "http-policy-redirect"?: 'enable' | 'disable',
    "ssh-policy-redirect"?: 'enable' | 'disable',
    "webproxy-profile"?: string,
    "profile-type"?: string,
    "profile-group"?: string,
    "profile-protocol-options"?: 'string',
    "ssl-ssh-profile"?: 'string',
    "av-profile"?: string,
    "webfilter-profile"?: string,
    "dnsfilter-profile"?: string,
    "emailfilter-profile"?: string,
    "dlp-sensor"?: string,
    "file-filter-profile"?: string,
    "ips-sensor"?: string,
    "application-list"?: string,
    "voip-profile"?: string,
    "sctp-filter-profile"?: string,
    "icap-profile"?: string,
    "cifs-profile"?: string,
    "videofilter-profile"?: string,
    "waf-profile"?: string,
    "ssh-filter-profile"?: string,
    "logtraffic"?: string,
    "logtraffic-start"?: 'enable' | 'disable',
    "auto-asic-offload"?: 'enable' | 'disable',
    "np-acceleration"?: 'enable' | 'disable',
    "webproxy-forward-server"?: string,
    "traffic-shaper"?: string,
    "traffic-shaper-reverse"?: string,
    "per-ip-shaper"?: string,
    "nat"?: 'enable' | 'disable',
    "permit-any-host"?: 'enable' | 'disable',
    "permit-stun-host"?: 'enable' | 'disable',
    "fixedport"?: 'enable' | 'disable',
    "ippool"?: 'enable' | 'disable',
    "poolname"?:[
    ],
    "poolname6"?:[
    ],
    "session-ttl"?: string,
    "vlan-cos-fwd"?: number,
    "vlan-cos-rev"?: number,
    "inbound"?: 'enable' | 'disable',
    "outbound"?: 'enable' | 'disable',
    "natinbound"?: 'enable' | 'disable',
    "natoutbound"?: 'enable' | 'disable',
    "wccp"?: 'enable' | 'disable',
    "ntlm"?: 'enable' | 'disable',
    "ntlm-guest"?: 'enable' | 'disable',
    "ntlm-enabled-browsers"?:[
    ],
    "fsso-agent-for-ntlm"?:"",
    "groups"?: FortigateElement[],
    "users"?: FortigateElement[],
    "fsso-groups"?: FortigateElement[],
    "auth-path"?: 'enable' | 'disable',
    "disclaimer"?: 'enable' | 'disable',
    "email-collect"?: 'enable' | 'disable',
    "vpntunnel"?: string,
    "natip"?: string,
    "match-vip"?: 'enable' | 'disable',
    "match-vip-only"?: 'enable' | 'disable',
    "diffserv-forward"?: 'enable' | 'disable',
    "diffserv-reverse"?: 'enable' | 'disable',
    "diffservcode-forward"?: string,
    "diffservcode-rev"?: string,
    "tcp-mss-sender"?:0,
    "tcp-mss-receiver"?:0,
    "comments"?: string,
    "label"?: string,
    "global-label"?: string,
    "auth-cert"?: string,
    "auth-redirect-addr"?: string,
    "redirect-url"?: string,
    "identity-based-route"?: string,
    "block-notification"?: 'enable' | 'disable',
    "custom-log-fields"?:[
    ],
    "replacemsg-override-group"?: string,
    "srcaddr-negate"?: 'enable' | 'disable',
    "dstaddr-negate"?: 'enable' | 'disable',
    "service-negate"?: 'enable' | 'disable',
    "internet-service-negate"?: 'enable' | 'disable',
    "internet-service-src-negate"?: 'enable' | 'disable',
    "timeout-send-rst"?: 'enable' | 'disable',
    "captive-portal-exempt"?: 'enable' | 'disable',
    "decrypted-traffic-mirror"?: string,
    "dsri"?: 'enable' | 'disable',
    "radius-mac-auth-bypass"?: 'enable' | 'disable',
    "delay-tcp-npu-session"?: 'enable' | 'disable',
    "vlan-filter"?: string,
    "sgt-check"?: 'enable' | 'disable',
    "sgt"?:[
    ]
}

// Future common types


// Intended to abstract OpenConnect VPNs (Cisco, Juniper, Fortigate, etc..)
export interface OpenConnectVPN {
    minTLSProtocol?: 'tls1.0' | 'tls1.1' | 'tls1.2' | 'tls1.3'
    maxTLSProtocol?: 'tls1.0' | 'tls1.1' | 'tls1.2' | 'tls1.3'
    ciphersuite?: string,
    bannedCipher?: string,
    sessionTTL: number,
    listenPort: number,
    
    // Below is prone to change, stay tuned!
    authServerId: {
        serverId: string,
        permission: string,
    }[]
}
