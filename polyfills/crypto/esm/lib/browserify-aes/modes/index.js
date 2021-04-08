import * as ecb from "./ecb";
import * as cbc from "./cbc";
import * as cfb from "./cfb";
import * as cfb8 from "./cfb8";
import * as cfb1 from "./cfb1";
import * as ofb from "./ofb";
import * as ctr from "./ctr";
import * as modes from "./list.json";
var modeModules = {
    ECB: ecb,
    CBC: cbc,
    CFB: cfb,
    CFB8: cfb8,
    CFB1: cfb1,
    OFB: ofb,
    CTR: ctr,
    GCM: ctr
};
for (var key in modes) {
    modes[key].module = modeModules[modes[key].mode];
}
export default modes;
