var compiler = require('./lib/compiler');

module.exports = function(content) {
	this.cacheable();
	
	var opts = {
		sourceMap: this.sourceMap,
		sourcePath: this.resourcePath,
		target: this.target,
		ENV_DEBUG: this.debug,
		standalone: false,
		bare: true
	};
	if(this.env){
		opts.env = this.env;
	}

	try {
		var result = compiler.compile(content, opts);
		var js = result.toString();
		this.callback(null, js, result.sourcemap);
	} catch(e) {
		this.emitError(e.prettyMessage());
		// this.callback(null,"");
	}
	
}