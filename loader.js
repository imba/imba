var compiler = require('./lib/compiler');
var path = require('path');

module.exports = function(content) {
	this.cacheable();
	
	var opts = {
		filename: path.basename(this.resourcePath),
		sourceMap: this.sourceMap,
		sourcePath: this.resourcePath,
		target: this.target,
		ENV_DEBUG: this.debug,
		ENV_WEBPACK: true,
		bare: true
	};

	if(this.env){
		opts.env = this.env;
	}

	if(this.options.loader && this.options.loader.imba) {
		var iopts = this.options.loader.imba;
		Object.keys(iopts).forEach(function(k){
			opts[k] = iopts[k];
		})
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