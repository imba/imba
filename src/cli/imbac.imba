var helpers = require "../compiler/helpers"
var compiler = require "../compiler/compiler"


export def run args
	var o = helpers.parseArgs(args,{
		alias:
			o: 'output',
			s: 'stdio',
			b: 'bare',
			p: 'print'
		schema:
			output: {type: 'string'}

		group: ['source-map']
	})
	console.log 'o',o,args
