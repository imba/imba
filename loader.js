var compiler = require('./lib/compiler');
var path = require('path');

module.exports = function(content) {
	this.cacheable();
	
	var query = this.query;

	var opts = {
		filename: path.basename(this.resourcePath),
		sourceMap: this.sourceMap,
		sourcePath: this.resourcePath,
		target: this.target,
		ENV_DEBUG: this.debug,
		ENV_WEBPACK: true
	};

	if(this.env){
		opts.env = this.env;
	}

	if(query instanceof Object) {
		Object.keys(query).forEach(function(key){
			opts[key] = query[key];
		});
	}

	try {
		var result = compiler.compile(content, opts);
		var js = result.toString();
		this.callback(null, js, result.sourcemap);
	} catch(e) {
		this.emitError(e.prettyMessage ? e.prettyMessage() : e.message);
		// this.callback(null,"");
	}
}