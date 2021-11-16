export interface Route {
    id?: number,
    type: 'ipv4' | 'ipv6'
    srcaddr?: string,
    srcif?: string,
    dstaddr?: string,
    dstif?: string,
    gateway?: string,
    comment?: string,
    enable?: boolean,
    priority: number,
}
