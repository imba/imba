import assert from "assert";
import { inherits as inherits$0 } from "util";
'use strict';
var inherits = { inherits: inherits$0 }.inherits;
function isSurrogatePair(msg, i) {
    if ((msg.charCodeAt(i) & 0xFC00) !== 0xD800) {
        return false;
    }
    if (i < 0 || i + 1 >= msg.length) {
        return false;
    }
    return (msg.charCodeAt(i + 1) & 0xFC00) === 0xDC00;
}
function toArray(msg, enc) {
    if (Array.isArray(msg))
        return msg.slice();
    if (!msg)
        return [];
    var res = [];
    if (typeof msg === 'string') {
        if (!enc) {
            // Inspired by stringToUtf8ByteArray() in closure-library by Google
            // https://github.com/google/closure-library/blob/8598d87242af59aac233270742c8984e2b2bdbe0/closure/goog/crypt/crypt.js#L117-L143
            // Apache License 2.0
            // https://github.com/google/closure-library/blob/master/LICENSE
            var p = 0;
            for (var i = 0; i < msg.length; i++) {
                var c = msg.charCodeAt(i);
                if (c < 128) {
                    res[p++] = c;
                }
                else if (c < 2048) {
                    res[p++] = (c >> 6) | 192;
                    res[p++] = (c & 63) | 128;
                }
                else if (isSurrogatePair(msg, i)) {
                    c = 0x10000 + ((c & 0x03FF) << 10) + (msg.charCodeAt(++i) & 0x03FF);
                    res[p++] = (c >> 18) | 240;
                    res[p++] = ((c >> 12) & 63) | 128;
                    res[p++] = ((c >> 6) & 63) | 128;
                    res[p++] = (c & 63) | 128;
                }
                else {
                    res[p++] = (c >> 12) | 224;
                    res[p++] = ((c >> 6) & 63) | 128;
                    res[p++] = (c & 63) | 128;
                }
            }
        }
        else if (enc === 'hex') {
            msg = msg.replace(/[^a-z0-9]+/ig, '');
            if (msg.length % 2 !== 0)
                msg = '0' + msg;
            for (i = 0; i < msg.length; i += 2)
                res.push(parseInt(msg[i] + msg[i + 1], 16));
        }
    }
    else {
        for (i = 0; i < msg.length; i++)
            res[i] = msg[i] | 0;
    }
    return res;
}
function toHex(msg) {
    var res = '';
    for (var i = 0; i < msg.length; i++)
        res += zero2(msg[i].toString(16));
    return res;
}
function htonl(w) {
    var res = (w >>> 24) |
        ((w >>> 8) & 0xff00) |
        ((w << 8) & 0xff0000) |
        ((w & 0xff) << 24);
    return res >>> 0;
}
function toHex32(msg, endian) {
    var res = '';
    for (var i = 0; i < msg.length; i++) {
        var w = msg[i];
        if (endian === 'little')
            w = htonl(w);
        res += zero8(w.toString(16));
    }
    return res;
}
function zero2(word) {
    if (word.length === 1)
        return '0' + word;
    else
        return word;
}
function zero8(word) {
    if (word.length === 7)
        return '0' + word;
    else if (word.length === 6)
        return '00' + word;
    else if (word.length === 5)
        return '000' + word;
    else if (word.length === 4)
        return '0000' + word;
    else if (word.length === 3)
        return '00000' + word;
    else if (word.length === 2)
        return '000000' + word;
    else if (word.length === 1)
        return '0000000' + word;
    else
        return word;
}
function join32(msg, start, end, endian) {
    var len = end - start;
    assert(len % 4 === 0);
    var res = new Array(len / 4);
    for (var i = 0, k = start; i < res.length; i++, k += 4) {
        var w;
        if (endian === 'big')
            w = (msg[k] << 24) | (msg[k + 1] << 16) | (msg[k + 2] << 8) | msg[k + 3];
        else
            w = (msg[k + 3] << 24) | (msg[k + 2] << 16) | (msg[k + 1] << 8) | msg[k];
        res[i] = w >>> 0;
    }
    return res;
}
function split32(msg, endian) {
    var res = new Array(msg.length * 4);
    for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
        var m = msg[i];
        if (endian === 'big') {
            res[k] = m >>> 24;
            res[k + 1] = (m >>> 16) & 0xff;
            res[k + 2] = (m >>> 8) & 0xff;
            res[k + 3] = m & 0xff;
        }
        else {
            res[k + 3] = m >>> 24;
            res[k + 2] = (m >>> 16) & 0xff;
            res[k + 1] = (m >>> 8) & 0xff;
            res[k] = m & 0xff;
        }
    }
    return res;
}
function rotr32(w, b) {
    return (w >>> b) | (w << (32 - b));
}
function rotl32(w, b) {
    return (w << b) | (w >>> (32 - b));
}
function sum32(a, b) {
    return (a + b) >>> 0;
}
function sum32_3(a, b, c) {
    return (a + b + c) >>> 0;
}
function sum32_4(a, b, c, d) {
    return (a + b + c + d) >>> 0;
}
function sum32_5(a, b, c, d, e) {
    return (a + b + c + d + e) >>> 0;
}
function sum64(buf, pos, ah, al) {
    var bh = buf[pos];
    var bl = buf[pos + 1];
    var lo = (al + bl) >>> 0;
    var hi = (lo < al ? 1 : 0) + ah + bh;
    buf[pos] = hi >>> 0;
    buf[pos + 1] = lo;
}
function sum64_hi(ah, al, bh, bl) {
    var lo = (al + bl) >>> 0;
    var hi = (lo < al ? 1 : 0) + ah + bh;
    return hi >>> 0;
}
function sum64_lo(ah, al, bh, bl) {
    var lo = al + bl;
    return lo >>> 0;
}
function sum64_4_hi(ah, al, bh, bl, ch, cl, dh, dl) {
    var carry = 0;
    var lo = al;
    lo = (lo + bl) >>> 0;
    carry += lo < al ? 1 : 0;
    lo = (lo + cl) >>> 0;
    carry += lo < cl ? 1 : 0;
    lo = (lo + dl) >>> 0;
    carry += lo < dl ? 1 : 0;
    var hi = ah + bh + ch + dh + carry;
    return hi >>> 0;
}
function sum64_4_lo(ah, al, bh, bl, ch, cl, dh, dl) {
    var lo = al + bl + cl + dl;
    return lo >>> 0;
}
function sum64_5_hi(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
    var carry = 0;
    var lo = al;
    lo = (lo + bl) >>> 0;
    carry += lo < al ? 1 : 0;
    lo = (lo + cl) >>> 0;
    carry += lo < cl ? 1 : 0;
    lo = (lo + dl) >>> 0;
    carry += lo < dl ? 1 : 0;
    lo = (lo + el) >>> 0;
    carry += lo < el ? 1 : 0;
    var hi = ah + bh + ch + dh + eh + carry;
    return hi >>> 0;
}
function sum64_5_lo(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
    var lo = al + bl + cl + dl + el;
    return lo >>> 0;
}
function rotr64_hi(ah, al, num) {
    var r = (al << (32 - num)) | (ah >>> num);
    return r >>> 0;
}
function rotr64_lo(ah, al, num) {
    var r = (ah << (32 - num)) | (al >>> num);
    return r >>> 0;
}
function shr64_hi(ah, al, num) {
    return ah >>> num;
}
function shr64_lo(ah, al, num) {
    var r = (ah << (32 - num)) | (al >>> num);
    return r >>> 0;
}
export { inherits };
export { toArray };
export { toHex };
export { htonl };
export { toHex32 };
export { zero2 };
export { zero8 };
export { join32 };
export { split32 };
export { rotr32 };
export { rotl32 };
export { sum32 };
export { sum32_3 };
export { sum32_4 };
export { sum32_5 };
export { sum64 };
export { sum64_hi };
export { sum64_lo };
export { sum64_4_hi };
export { sum64_4_lo };
export { sum64_5_hi };
export { sum64_5_lo };
export { rotr64_hi };
export { rotr64_lo };
export { shr64_hi };
export { shr64_lo };
