import crypto from "crypto";

export function hashString(value: string): string {
    const hash = crypto.createHash("sha256");
    hash.update(value);
    return hash.digest("hex");
}
export function getHrefWithoutOrigin(url: URL) {
    return url.href.replace(new RegExp(`^${url.origin}`), "");
}
