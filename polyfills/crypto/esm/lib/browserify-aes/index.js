import * as ciphers from "./encrypter";
import * as deciphers from "./decrypter";
import * as modes from "./modes/list.json";
function getCiphers() {
    return Object.keys(modes);
}
export const Cipher = ciphers.createCipher;
export const Cipheriv = ciphers.createCipheriv;
export const Decipher = deciphers.createDecipher;
export const Decipheriv = deciphers.createDecipheriv;
export { getCiphers };

export const createCipher = ciphers.createCipher;
export const createCipheriv = ciphers.createCipheriv;
export const createDecipher = deciphers.createDecipher;
export const createDecipheriv = deciphers.createDecipheriv;