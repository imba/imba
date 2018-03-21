var compiler = require('./lib/compiler');
var helpers = require('./lib/compiler/helpers');
var path = require('path');

module.exports = function(content) {
	this.cacheable();
	
	var self = this;
	var query = this.query;

	var opts = {
		filename: path.basename(this.resourcePath),
		sourceMap: this.sourceMap,
		sourcePath: this.resourcePath,
		target: this.target,
		comments: false,
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
		if(result.warnings && true){
			result.warnings.forEach(function(warn){
				var msg = helpers.printWarning(result.source,warn);
				var err = new Error(msg);
				self.emitWarning(err);
			});
		}
		this.callback(null, js, result.sourcemap);
		
	} catch(e) {
		var err = new Error(e.prettyMessage ? e.prettyMessage() : e.message);
		this.emitError(err);
	}
}