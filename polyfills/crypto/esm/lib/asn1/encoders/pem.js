import { inherits as inherits$0 } from "util";
import DEREncoder from "./der";
'use strict';
const inherits = { inherits: inherits$0 }.inherits;
function PEMEncoder(entity) {
    DEREncoder.call(this, entity);
    this.enc = 'pem';
}
inherits(PEMEncoder, DEREncoder);
PEMEncoder.prototype.encode = function encode(data, options) {
    const buf = DEREncoder.prototype.encode.call(this, data);
    const p = buf.toString('base64');
    const out = ['-----BEGIN ' + options.label + '-----'];
    for (let i = 0; i < p.length; i += 64)
        out.push(p.slice(i, i + 64));
    out.push('-----END ' + options.label + '-----');
    return out.join('\n');
};
export default PEMEncoder;
