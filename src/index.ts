export class Mareel {
}

export { ControllerFactory as EFMControllerFactory} from './driver/efm/lib';
export { ControllerFactory as CiscoControllerFactory} from './driver/cisco/lib';
export { ControllerFactory as GenericControllerFactory} from './driver/generic/lib';

// Test export
export { MIBLoader } from './util/snmp/mibloader';
export { CiscoTFTPServer } from './util/tftp';

import {svcmain} from './connector/client';

if(require.main === module) {
    svcmain().catch((e: Error) => {
        console.error(e);
        // TODO: Implement error handler here
    })
} else {
    // Do nothing.
}