import { AuthError, MarilError } from "../../error/MarilError";

export class ResponseChecker {
    /**
     * Parse response from the router and determine it errored or not
     * Note that EFM router always return 200 OK to 401 / 403 error class.
     * 
     * @param data - Return HTML data
     */
    public static check(data: string | Buffer): void {
        if (data instanceof Buffer) return;

        if (data.match(/top\.location = "\/sess-bin\/login_session\.cgi"/) != null) {
            throw new AuthError("Unauthorized");
        }

        if (data.match(/top\.location = "\/"/) != null) {
            throw new MarilError("Bad EFM referer value");
        }
    }
}