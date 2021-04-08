// import crypto from "crypto";
import randomBytes from '../randombytes'
var r;
function Rand(rand) {
    this.rand = rand;
}
Rand.prototype.generate = function generate(len) {
    return this._rand(len);
};
// Emulate crypto API using randy
/* Rand.prototype._rand = function _rand(n) {
    if (this.rand.getBytes)
        return this.rand.getBytes(n);
    var res = new Uint8Array(n);
    for (var i = 0; i < res.length; i++)
        res[i] = this.rand.getByte();
    return res;
}; */
Rand.prototype._rand = function _rand(n) {
    return randomBytes(n);
    // var arr = new Uint8Array(n);
    // self.crypto.getRandomValues(arr);
    // return arr;
};

/* if (typeof self === 'object') {
    if (self.crypto && self.crypto.getRandomValues) {
        // Modern browsers
        Rand.prototype._rand = function _rand(n) {
            return randomBytes(n);
            // var arr = new Uint8Array(n);
            // self.crypto.getRandomValues(arr);
            // return arr;
        };
    }
    else if (self.msCrypto && self.msCrypto.getRandomValues) {
        // IE
        Rand.prototype._rand = function _rand(n) {
            var arr = new Uint8Array(n);
            self.msCrypto.getRandomValues(arr);
            return arr;
        };
        // Safari's WebWorkers do not have `crypto`
    }
    else if (typeof window === 'object') {
        // Old junk
        Rand.prototype._rand = function () {
            throw new Error('Not implemented yet');
        };
    }
}
else {
    // Node.js or Web worker with no crypto support
    try {
        if (typeof crypto.randomBytes !== 'function')
            throw new Error('Not supported');
        Rand.prototype._rand = function _rand(n) {
            return crypto.randomBytes(n);
        };
    }
    catch (e) {
    }
} */
function rand(len) {
    if (!r)
        r = new Rand(null);
    return r.generate(len);
};

rand.Rand = Rand;

export default rand;
export { Rand };
