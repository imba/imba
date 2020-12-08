export class SourceMapper
	
	static def strip input
		input.replace(/\/\*\%([\w\|]*)\$\*\//g,'')

	static def run input, o = {}
		let output = input.replace(/\/\*\%([\w\|]*)\$\*\//g,'')
		return {
			code: output
			map: null
			toString: do this.code
		}

		