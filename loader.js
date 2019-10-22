
const qs = require('querystring');
const { compileStyle } = require('@vue/component-compiler-utils');

var compiler = require('./lib/compiler');
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

	opts.id = shorthash(this.resourcePath);

	if(options.type == 'style' && options.body){
		return this.callback(null,options.body);
	}

	// style post-processor
	if(resourceQuery && resourceQuery.type == 'style'){
		const { code, map, errors } = compileStyle({
			source: content,
			filename: this.resourcePath + '.css',
			id: `data-i-${resourceQuery.id}`,
			map: inMap,
			scoped: !!resourceQuery.id,
			trim: true
		});

		if (errors.length) {
			return this.callback(errors[0])
		} else {
			return this.callback(null, code, map)
		}
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

		// import './file.js.css!=!extract-style-loader/getStyles!./file.js';

		if(result.styles && result.styles.length) {
			// check if we have scoped styles -- should be scoped by default?
			// js = `const $TagScopeId$ = "data-i-${opts.id}" ;\n` + js;
			js = js.replace(/\/\*SCOPEID\*\//g,'"' + opts.id + '"');

			result.styles.forEach((style,i) => {
				const ext = style.type || 'css';
				const src = style.src || (self.resourcePath + '.' + i + '.' + ext);
				const inheritQuery = self.resourceQuery.slice(1)
				const body = encodeURIComponent(style.content);
				const remReq = getRemainingRequest(self);
				let pars = '?type=style';

				if(style.scoped){
					pars = pars + "&id=" + opts.id;
				}
				const query = `${src}!=!imba/loader?type=style&index=${i}&body=${body}!${remReq}${pars}`
				js += "\nrequire('" + query + "');"
			})
		}

		this.callback(null, js, result.sourcemap);
		
	} catch(e) {
		var err = new Error(e.prettyMessage ? e.prettyMessage() : e.message);
		this.emitError(err);
	}
}