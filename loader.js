var compiler = require('./lib/compiler');

module.exports = function(content) {
	this.cacheable();
	
	var opts = {
		sourceMap: this.sourceMap,
		sourcePath: this.resourcePath,
		target: this.target,
		bare: true
	};

	var result = compiler.compile(content, opts);
	var js = result.toString();
	
	this.callback(null, js, result.sourcemap);
}