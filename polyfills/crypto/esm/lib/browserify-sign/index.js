import createHash from "../create-hash";
import stream from "stream";
import { inherits as inherits$0 } from "util";
import sign from "./sign";
import verify from "./verify";
import algorithms from "./algorithms.json";
var inherits = { inherits: inherits$0 }.inherits;
Object.keys(algorithms).forEach(function (key) {
    algorithms[key].id = Buffer.from(algorithms[key].id, 'hex');
    algorithms[key.toLowerCase()] = algorithms[key];
});
function Sign(algorithm) {
    stream.Writable.call(this);
    var data = algorithms[algorithm];
    if (!data)
        throw new Error('Unknown message digest');
    this._hashType = data.hash;
    this._hash = createHash(data.hash);
    this._tag = data.id;
    this._signType = data.sign;
}
inherits(Sign, stream.Writable);
Sign.prototype._write = function _write(data, _, done) {
    this._hash.update(data);
    done();
};
Sign.prototype.update = function update(data, enc) {
    if (typeof data === 'string')
        data = Buffer.from(data, enc);
    this._hash.update(data);
    return this;
};
Sign.prototype.sign = function signMethod(key, enc) {
    this.end();
    var hash = this._hash.digest();
    var sig = sign(hash, key, this._hashType, this._signType, this._tag);
    return enc ? sig.toString(enc) : sig;
};
function Verify(algorithm) {
    stream.Writable.call(this);
    var data = algorithms[algorithm];
    if (!data)
        throw new Error('Unknown message digest');
    this._hash = createHash(data.hash);
    this._tag = data.id;
    this._signType = data.sign;
}
inherits(Verify, stream.Writable);
Verify.prototype._write = function _write(data, _, done) {
    this._hash.update(data);
    done();
};
Verify.prototype.update = function update(data, enc) {
    if (typeof data === 'string')
        data = Buffer.from(data, enc);
    this._hash.update(data);
    return this;
};
Verify.prototype.verify = function verifyMethod(key, sig, enc) {
    if (typeof sig === 'string')
        sig = Buffer.from(sig, enc);
    this.end();
    var hash = this._hash.digest();
    return verify(sig, hash, key, this._signType, this._tag);
};
function createSign(algorithm) {
    return new Sign(algorithm);
}
function createVerify(algorithm) {
    return new Verify(algorithm);
}
export { createSign as Sign };
export { createVerify as Verify };
export { createSign };
export { createVerify };
export default {
    Sign: createSign,
    Verify: createVerify,
    createSign: createSign,
    createVerify: createVerify
};
