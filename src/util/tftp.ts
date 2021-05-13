import tftp from 'tftp';
import { EventEmitter } from 'events'


export class CiscoTFTPServer extends EventEmitter {
    private tftpServer: TFTPServer;
    private fileSendTable: {[filename: string]: Buffer} = {};
    private fileRecvTable: {[filename: string]: (stream: TFTPReq) => void} = {};

    constructor() {
        super();
        this.tftpServer = tftp.createServer({
            port :69,
        }, this.reqHandler.bind(this));
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
            if (ent == null) {
                req.abort(tftp.ENOENT);
            } else {
                res.write(ent);
            }
        } else {
            req.abort(tftp.EIO);
        }
    }

    listen() {
        this.tftpServer.listen();
    }

    close() {
        this.tftpServer.close();
    }

    addFileToServe(filename: string, data: Buffer) {
        this.fileSendTable[filename] = data;
    }

    reserveFileToRecv(filename: string, listener: (stream: TFTPReq) => void) {
        this.fileRecvTable[filename] = listener;
    }
}