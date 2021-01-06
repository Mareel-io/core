import { AuthError, MarilError } from "../../error/MarilError";

export class ResponseChecker {
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