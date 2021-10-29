import DES from "../browserify-des";
import * as aes from "../browserify-aes";
import aesModes from "../browserify-aes/modes";
import desModes from "../browserify-des/modes.json";
import ebtk from "../evp_bytestokey";
function createCipher(suite, password) {
    suite = suite.toLowerCase();
    var keyLen, ivLen;
    if (aesModes[suite]) {
        keyLen = aesModes[suite].key;
        ivLen = aesModes[suite].iv;
    }
    else if (desModes[suite]) {
        keyLen = desModes[suite].key * 8;
        ivLen = desModes[suite].iv;
    }
    else {
        throw new TypeError('invalid suite type');
    }
    var keys = ebtk(password, false, keyLen, ivLen);
    return createCipheriv(suite, keys.key, keys.iv);
}
function createDecipher(suite, password) {
    suite = suite.toLowerCase();
    var keyLen, ivLen;
    if (aesModes[suite]) {
        keyLen = aesModes[suite].key;
        ivLen = aesModes[suite].iv;
    }
    else if (desModes[suite]) {
        keyLen = desModes[suite].key * 8;
        ivLen = desModes[suite].iv;
    }
    else {
        throw new TypeError('invalid suite type');
    }
    var keys = ebtk(password, false, keyLen, ivLen);
    return createDecipheriv(suite, keys.key, keys.iv);
}
function createCipheriv(suite, key, iv) {
    suite = suite.toLowerCase();
    if (aesModes[suite])
        return aes.createCipheriv(suite, key, iv);
    if (desModes[suite])
        return new DES({ key: key, iv: iv, mode: suite });
    throw new TypeError('invalid suite type');
}
function createDecipheriv(suite, key, iv) {
    suite = suite.toLowerCase();
    if (aesModes[suite])
        return aes.createDecipheriv(suite, key, iv);
    if (desModes[suite])
        return new DES({ key: key, iv: iv, mode: suite, decrypt: true });
    throw new TypeError('invalid suite type');
}
function getCiphers() {
    return Object.keys(desModes).concat(aes.getCiphers());
}
export { createCipher as Cipher };
export { createCipheriv as Cipheriv };
export { createDecipher as Decipher };
export { createDecipheriv as Decipheriv };
export { getCiphers };
