import Script,{Node,Token} from '../index'
import code from './sample.txt'
let script = new Script({fileName: "/one.imba"},code)
console.log script.getGeneratedDTS!