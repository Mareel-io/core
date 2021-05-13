interface TFTPReq extends NodeJS.ReadableStream {
    abort: (errno: number) => void;
    file: string,
    method: string,
}

interface TFTPRes extends NodeJS.WritableStream {
    setSize: (sz: number) => void;
}

interface TFTPCfg {
    host?: string;
    port?: number;
}

interface TFTPServer {
    on: (event: 'error', listener: (e: Error) => void) => void;
    on: (event: 'close', listener: () => void) => void;
    close: () => void;
    listen: () => void;
}

declare module 'tftp' {
    function createServer(cfg: TFTPCfg, listener: (req: TFTPReq, res: TFTPRes) => void): TFTPServer;
    const EIO: number;
    const ENOENT: number;
    const EACCESS: number;
    const ENOSPC: number;
    const EBADOP: number;
    const ETID: number;
    const EEXIST: number;
    const ENOUSER: number;
    const EDENY: number;
    const ESOCKET: number;
    const EBADMSG: number;
    const EABORT: number;
    const EFBIG: number;
    const ETIME: number;
    const EBADMODE: number;
    const EBADNAME: number;
    const EIO: number;
    const ENOGET: number;
    const ENOPUT: number;
    const ERBIG: number;
    const ECONPUT: number;
    const ECURPUT: number;
    const ECURGET: number;
}