import xor from "../../buffer-xor";
export const encrypt = function (self, block) {
    var data = xor(block, self._prev);
    self._prev = self._cipher.encryptBlock(data);
    return self._prev;
};
export const decrypt = function (self, block) {
    var pad = self._prev;
    self._prev = block;
    var out = self._cipher.decryptBlock(block);
    return xor(out, pad);
};
