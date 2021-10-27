import xor from "../../buffer-xor";
function getBlock(self) {
    self._prev = self._cipher.encryptBlock(self._prev);
    return self._prev;
}
export const encrypt = function (self, chunk) {
    while (self._cache.length < chunk.length) {
        self._cache = Buffer.concat([self._cache, getBlock(self)]);
    }
    var pad = self._cache.slice(0, chunk.length);
    self._cache = self._cache.slice(chunk.length);
    return xor(chunk, pad);
};
