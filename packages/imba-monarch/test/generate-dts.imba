import Script,{Node,Token} from '../index'

let code = `
global class Hello

	get something
		yes
`

let script = new Script(null,code)

console.log script.getGeneratedDTS!