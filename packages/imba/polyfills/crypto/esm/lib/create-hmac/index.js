import { inherits as inherits$0 } from "util";
import Legacy from "./legacy";
import Base from "../cipher-base";
import md5 from "../create-hash/md5";
import RIPEMD160 from "../ripemd160";
import sha from "../sha/index.js";
'use strict';
var inherits = { inherits: inherits$0 }.inherits;
var ZEROS = Buffer.alloc(128);
function Hmac(alg, key) {
    Base.call(this, 'digest');
    if (typeof key === 'string') {
        key = Buffer.from(key);
    }
    var blocksize = (alg === 'sha512' || alg === 'sha384') ? 128 : 64;
    this._alg = alg;
    this._key = key;
    if (key.length > blocksize) {
        var hash = alg === 'rmd160' ? new RIPEMD160() : sha(alg);
        key = hash.update(key).digest();
    }
    else if (key.length < blocksize) {
        key = Buffer.concat([key, ZEROS], blocksize);
    }
    var ipad = this._ipad = Buffer.allocUnsafe(blocksize);
    var opad = this._opad = Buffer.allocUnsafe(blocksize);
    for (var i = 0; i < blocksize; i++) {
        ipad[i] = key[i] ^ 0x36;
        opad[i] = key[i] ^ 0x5C;
    }
    this._hash = alg === 'rmd160' ? new RIPEMD160() : sha(alg);
    this._hash.update(ipad);
}
inherits(Hmac, Base);
Hmac.prototype._update = function (data) {
    this._hash.update(data);
};
Hmac.prototype._final = function () {
    var h = this._hash.digest();
    var hash = this._alg === 'rmd160' ? new RIPEMD160() : sha(this._alg);
    return hash.update(this._opad).update(h).digest();
};
export default (function createHmac(alg, key) {
    alg = alg.toLowerCase();
    if (alg === 'rmd160' || alg === 'ripemd160') {
        return new Hmac('rmd160', key);
    }
    if (alg === 'md5') {
        return new Legacy(md5, key);
    }
    return new Hmac(alg, key);
});
