import * as utils from "../utils";
'use strict';
var rotr32 = utils.rotr32;
function ft_1(s, x, y, z) {
    if (s === 0)
        return ch32(x, y, z);
    if (s === 1 || s === 3)
        return p32(x, y, z);
    if (s === 2)
        return maj32(x, y, z);
}
function ch32(x, y, z) {
    return (x & y) ^ ((~x) & z);
}
function maj32(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
}
function p32(x, y, z) {
    return x ^ y ^ z;
}
function s0_256(x) {
    return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
}
function s1_256(x) {
    return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
}
function g0_256(x) {
    return rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3);
}
function g1_256(x) {
    return rotr32(x, 17) ^ rotr32(x, 19) ^ (x >>> 10);
}
export { ft_1 };
export { ch32 };
export { maj32 };
export { p32 };
export { s0_256 };
export { s1_256 };
export { g0_256 };
export { g1_256 };
