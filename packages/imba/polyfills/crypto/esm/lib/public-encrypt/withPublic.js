import BN from "../bn.js";
function withPublic(paddedMsg, key) {
    return Buffer.from(paddedMsg
        .toRed(BN.mont(key.modulus))
        .redPow(new BN(key.publicExponent))
        .fromRed()
        .toArray());
}
export default withPublic;
