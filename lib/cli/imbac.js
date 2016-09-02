(function(){
	var helpers = require("../compiler/helpers");
	var compiler = require("../compiler/compiler");
	
	
	function run(args){
		var o = helpers.parseArgs(args,{
			alias: {
				o: 'output',
				s: 'stdio',
				b: 'bare',
				p: 'print'
			},
			schema: {
				output: {type: 'string'}
			},
			
			group: ['source-map']
		});
		return console.log('o',o,args);
	}; exports.run = run;; return run;

})();