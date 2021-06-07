import tftp from 'tftp';
import { EventEmitter } from 'events'

export class CiscoTFTPServer extends EventEmitter {
    private tftpServer: TFTPServer;
    private fileSendTable: {[filename: string]: Buffer} = {};
    private fileRecvTable: {[filename: string]: (stream: TFTPReq) => void} = {};
    private systemIPv4Address: string;

    constructor(systemIPv4Address: string) {
        super();
        this.systemIPv4Address = systemIPv4Address;
        this.tftpServer = tftp.createServer({
            host: '0.0.0.0',
            port :69,
        }, (req, res) => {
            this.reqHandler(req, res);
        });
    }

    // Helper function from Axios.JS
    private combineURLs(baseURL: string, relativeURL: string) {
        return relativeURL
          ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
          : baseURL;
    }

    private reqHandler(req: TFTPReq, res: TFTPRes) {
        if (req.method === 'PUT') {
            const ent = this.fileRecvTable[req.file];
            if (ent == null) {
                req.abort(tftp.ENOPUT);
            } else {
                ent(req);
            }
        } else if (req.method === 'GET') {
            const ent = this.fileSendTable[req.file];
            delete this.fileSendTable[req.file];
            if (ent == null) {
                req.abort(tftp.ENOENT);
            } else {
                res.setSize(ent.length);
                res.write(ent);
            }
        } else {
            req.abort(tftp.EIO);
        }
    }

    public listen() {
        this.tftpServer.listen();
    }

    public close() {
        this.tftpServer.close();
    }

    public getCiscoTFTPURL(file: string) {
        return this.combineURLs(`tftp://${this.systemIPv4Address}/`, file);
    }

    public addFileToServe(filename: string, data: Buffer) {
        this.fileSendTable[filename] = data;
    }

    public reserveFileToRecv(filename: string, listener: (stream: NodeJS.ReadableStream) => void) {
        this.fileRecvTable[filename] = listener;
    }
}