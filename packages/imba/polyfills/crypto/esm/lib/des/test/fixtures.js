'use strict';
export function bin(str) {
    return parseInt(str.replace(/[^01]/g, ''), 2);
}
