import {vi} from "vitest"
import assert from "assert"
import 'imba/std'

vi.stubGlobal('rejects', assert.rejects)

const ok = (nook = false)=> (...args) =>{

	if (args.length <= 1) {
		if(nook){
			return expect(args[0]).not.toBeTruthy()
		}else{
			return expect(args[0]).toBeTruthy()
		}
	} else {
		const [a, b, msg] = args
		try{
			if(nook){
				expect(a).not.toStrictEqual(b)
			}else{
				expect(a).toStrictEqual(b)
			}
		} catch(error){
			if(msg) console.error(msg)
			throw error
		}
	};
}
vi.stubGlobal('ok', ok());

vi.stubGlobal('nok',ok(true));
