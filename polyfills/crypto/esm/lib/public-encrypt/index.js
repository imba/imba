import publicEncryptInternal from "./publicEncrypt";
import privateDecryptInternal from "./privateDecrypt";

export function privateEncrypt(key, buf) {
    return publicEncryptInternal(key, buf, true);
}
export function publicDecrypt(key, buf) {
    return privateDecryptInternal(key, buf, true);
}