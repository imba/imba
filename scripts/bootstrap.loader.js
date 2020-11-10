
var compiler = require('./bootstrap.compiler.js');
var compiler2 = require('./bootstrap.compiler2.js');
var path = require('path');
var fs = require('fs');

module.exports = function(content,inMap) {
	this.cacheable();

	var self = this;
	var query = this.query;

	var opts = {
		filename: path.basename(this.resourcePath),
		sourceMap: this.sourceMap,
		sourcePath: this.resourcePath,
		target: this.target,
		platform: this.platform,
		comments: false,
		ENV_DEBUG: this.debug,
		ENV_WEBPACK: true
	};

	try {
		var handler = opts.filename.indexOf('.imba1') >= 0 ? compiler : compiler2;
		var result = handler.compile(content, opts);
		var js = result.toString();
		if(result.warnings){
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