export function fix(exports) {
    let keys = Object.keys(exports);
    let out = {};
    for (let key of keys) {
        console.log('key', key);
        out[key] = exports[key];
    }
    return out;
}