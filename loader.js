
const qs = require('querystring');

var compiler = require('./lib/compiler');
var csscompiler = require('./lib/compiler/css');
var helpers = require('./lib/compiler/helpers');
var path = require('path');

const crypto = require('crypto');
const utils = require('loader-utils');
const stringifyRequest = utils.stringifyRequest;
const getRemainingRequest = utils.getRemainingRequest;

const isESLintLoader = l => /(\/|\\|@)eslint-loader/.test(l.path)
const isNullLoader = l => /(\/|\\|@)null-loader/.test(l.path)
const isCSSLoader = l => /(\/|\\|@)css-loader/.test(l.path)
const isImbaLoader = l => /(\/|\\|@)imba\/loader/.test(l.path)
const isCacheLoader = l => /(\/|\\|@)cache-loader/.test(l.path)

const isPreLoader = l => !l.pitchExecuted
const isPostLoader = l => l.pitchExecuted

function shorthash(str){
	var shasum = crypto.createHash('sha1');
	shasum.update(str);
	return shasum.digest('hex').slice(0, 8);
}

var cachedStyleBodies = new Map();

module.exports = function(content,inMap) {
	this.cacheable();

	const options = utils.getOptions(this) || {};

	var self = this;
	var query = this.query;

	const resourceQuery = qs.parse(this.resourceQuery.slice(1));

	var opts = {
		filename: path.basename(this.resourcePath),
		sourceMap: this.sourceMap,
		sourcePath: this.resourcePath,
		target: this.target,
		comments: false,
		ENV_DEBUG: this.debug,
		ENV_WEBPACK: true
	};

	if(!opts.filename.match(/\.imba1?$/)){
		return this.callback(null,content);
	}

	opts.id = shorthash(this.resourcePath);


	const body = cachedStyleBodies.get(`${opts.id}-${options.index}`);
	if(options.type == 'style' && body){ 
		if(this.loaders.length == 1){
			// There are no additional style loaders -- we will need to process it directly
			let scope = resourceQuery.id ? '_' + resourceQuery.id : null;
			var css = csscompiler.compile(body,{scope: scope});
			let out = "var styles = document.createElement('style');"
			out = out + "styles.textContent = " + JSON.stringify(css) + ";\n"
			out = out + "document.head.appendChild(styles);"
			return this.callback(null, out, inMap);
		}
		return this.callback(null,body);
	}

	// style post-processor
	if(resourceQuery && resourceQuery.type == 'style'){
		let scope = resourceQuery.id ? '_' + resourceQuery.id : null;
		var css = csscompiler.compile(content,{scope: scope})
		return this.callback(null, css, inMap);
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

		if(result.styles && result.styles.length && this.target == 'web' && this.rootContext) {
			js = js.replace(/\/\*SCOPEID\*\//g,'"' + opts.id + '"');

			result.styles.forEach((style,i) => {
				const ext = style.type || 'css';
				const src = style.src || (self.resourcePath + '.' + i + '.' + ext);
				const inheritQuery = self.resourceQuery.slice(1)
				const remReq = getRemainingRequest(self);
				cachedStyleBodies.set(`${opts.id}-${i}`, style.content);
				const query = `${src}!=!imba/loader?type=style&index=${i}!${remReq}`
				js += "\nrequire('" + query + "');"
			})
		}

		this.callback(null, js, result.sourcemap);
		
	} catch(e) {
		var err = new Error(e.prettyMessage ? e.prettyMessage() : e.message);
		this.emitError(err);
	}
}
