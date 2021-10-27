import { inherits as inherits$0 } from "util";
import MD5 from "./md5.js";
import RIPEMD160 from "../ripemd160";
import sha from "../sha/index.js";
import Base from "../cipher-base";
var inherits = { inherits: inherits$0 }.inherits;
function Hash(hash) {
    Base.call(this, 'digest');
    this._hash = hash;
}
inherits(Hash, Base);
Hash.prototype._update = function (data) {
    this._hash.update(data);
};
Hash.prototype._final = function () {
    return this._hash.digest();
};
export default (function createHash(alg) {
    alg = alg.toLowerCase();
    if (alg === 'md5')
        return new MD5();
    if (alg === 'rmd160' || alg === 'ripemd160')
        return new RIPEMD160();
    return new Hash(sha(alg));
});
