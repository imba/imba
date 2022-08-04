import ImbaScriptDts from '../../typescript-imba-plugin/src/dts'
import {rewriteDts} from '../../typescript-imba-plugin/src/dtsutil'
import body from './ext.d.ts.2?as=text'
import fs from 'fs'

let dts = new ImbaScriptDts()
# dts.update(body)
# console.log dts.#body
# console.log dts.#mappings
let out = rewriteDts(body)
console.log out
fs.writeFileSync('./ext.out.d.ts.3',out)