export class SourceMapper

	static def run input, o = {}
		let output = input.replace(/\/\*\%([\w\|]*)\$\*\//g,'')
		return {
			code: output
			map: null
			toString: do this.code
		}

		