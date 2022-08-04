// import {StringExt, ManualGlobal as ManualGlobalProto} from './manualglobal'

import * as IN from './manualglobal'

declare global {
    interface ManualGlobal extends IN.ManualGlobal {}
    var ManualGlobal: typeof IN.ManualGlobal;
    interface String extends IN.StringExt {};
}