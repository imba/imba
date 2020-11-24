var compiler = require('./dist/compiler.cjs');
var helpers = compiler.helpers;

var path = require('path');
var fs = require('fs');
var loaderPath = fs.realpathSync(__filename);

const crypto = require('crypto');

function shorthash(str){
	var shasum = crypto.createHash('sha1');
	shasum.update(str);
	return shasum.digest('hex').slice(0, 8);
}

var cachedStyleBodies = new Map();

module.exports = function(content,inMap) {
	this.cacheable();

	var self = this;
	var query = this.query;

	var opts = {
		sourceMap: this.sourceMap,
		sourcePath: this.resourcePath,
		target: this.target,
		platform: this.target,
		comments: false,
		bundler: 'webpack',
		ENV_DEBUG: this.debug,
		ENV_WEBPACK: true,
	};

	if(!opts.sourcePath.match(/\.imba$/)){
		return this.callback(null,content);
	}

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
