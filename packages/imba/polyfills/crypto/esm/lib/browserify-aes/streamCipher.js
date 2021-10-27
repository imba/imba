import * as aes from "./aes";
import Transform from "../cipher-base";
import { inherits as inherits$0 } from "util";
var inherits = { inherits: inherits$0 }.inherits;
function StreamCipher(mode, key, iv, decrypt) {
    Transform.call(this);
    this._cipher = new aes.AES(key);
    this._prev = Buffer.from(iv);
    this._cache = Buffer.allocUnsafe(0);
    this._secCache = Buffer.allocUnsafe(0);
    this._decrypt = decrypt;
    this._mode = mode;
}
inherits(StreamCipher, Transform);
StreamCipher.prototype._update = function (chunk) {
    return this._mode.encrypt(this, chunk, this._decrypt);
};
StreamCipher.prototype._final = function () {
    this._cipher.scrub();
};
export default StreamCipher;
