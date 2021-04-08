export const encrypt = function (self, block) {
    return self._cipher.encryptBlock(block);
};
export const decrypt = function (self, block) {
    return self._cipher.decryptBlock(block);
};
