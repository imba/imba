import * as __path_module_0 from 'path';
import * as __util_module_1 from './helpers.mjs';
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
// imba$inlineHelpers=1
// imba$v2=0
// externs;

var path = __path_module_0;
var util = __util_module_1;

var VLQ_SHIFT = 5;
var VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT;
var VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1;
var BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function SourceMap(script,options){
	this._script = script;
	this._options = options || {};
	this._sourcePath = this._options.sourcePath;
	this._sourceRoot = this._options.sourceRoot;
	this._targetPath = this._options.targetPath;
	
	this._maps = [];
	this._map = "";
	this._js = "";
};


SourceMap.prototype.result = function(v){ return this._result; }
SourceMap.prototype.setResult = function(v){ this._result = v; return this; };

SourceMap.prototype.source = function (){
	return this._source;
};

SourceMap.prototype.options = function (){
	return this._options;
};

SourceMap.prototype.sourceCode = function (){
	return this._script.sourceCode;
};

SourceMap.prototype.sourceName = function (){
	return path.basename(this._sourcePath);
};

SourceMap.prototype.targetName = function (){
	return path.basename(this._targetPath);
};

SourceMap.prototype.sourceFiles = function (){
	return [this.sourceName()];
};

SourceMap.prototype.parse = function (){
	// var matcher = /\/\*\%\$(\d*)\$\%/
	var self = this;
	var matcher = /\/\*\%([\w\|]*)?\$\*\//;
	var replacer = /^(.*?)\/\*\%([\w\|]*)\$\*\//;
	var prejs = self._script.js;
	var lines = self._script.js.split(/\n/g); // what about js?
	var verbose = self._options.debug;
	// return self
	var sourceCode = self.sourceCode();
	var locmap = util.locationToLineColMap(sourceCode);
	var append = "";
	self._locs = [];
	self._maps = [];
	self._names = [];
	
	var pairs = [];
	var groups = {};
	var uniqueGroups = {};
	var match;
	// split the code in lines. go through each line
	// go through the code looking for LOC markers
	// remove markers along the way and keep track of
	// console.log source:js
	
	var jsloc = 0;
	
	for (let i = 0, items = iter$(lines), len = items.length, line; i < len; i++) {
		// console.log 'parse line',line
		// could split on these?
		line = items[i];
		var col = 0;
		var caret = -1;
		
		self._maps[i] = [];
		while (line.match(matcher)){
			line = line.replace(replacer,function(m,pre,meta) {
				var grp;
				if (meta == '') { return pre };
				let pars = meta.split('|');
				let loc = parseInt(pars[0]);
				let gid = pars[1] && parseInt(pars[1]);
				
				var lc = locmap[loc];
				
				if (!lc) {
					return pre;
				};
				
				let srcline = lc[0] + 1;
				let srccol = lc[1] + 1;
				
				if (caret != pre.length) {
					caret = pre.length;
					var mapping = [[srcline,srccol],[i + 1,caret + 1]]; // source and output
					self._maps[i].push(mapping);
				};
				
				let locpair = [jsloc + caret,loc];
				
				self._locs.push(locpair);
				
				if (gid) {
					if (grp = groups[gid]) {
						// groups[gid].push(locpair[0],locpair[1])
						grp[1] = locpair[0];
						grp[3] = locpair[1];
						// grp.START = locpair
						let gstr = grp.join('|');
						if (uniqueGroups[gstr]) {
							groups[gid] = [];
						} else {
							uniqueGroups[gstr] = true;
							let name = sourceCode.slice(grp[2],grp[3]);
							if (grp.START) {
								grp.START[2] = name;
								if (self._names.indexOf(name) < 0) {
									self._names.push(name);
								};
							};
						};
						// grp[4] = locpair[1]
					} else {
						groups[gid] = [locpair[0],null,locpair[1],null];
					};
					// pairs.push([jsloc + caret,parseInt(pars[2]),loc,parseInt(pars[1]) - loc ])
				};
				return pre;
			});
		};
		
		jsloc += line.length + 1;
		lines[i] = line;
	};
	
	self._script.js = lines.join('\n');
	self._script.locs = {
		// map: locmap
		// generated: @locs
		spans: Object.values(groups)
	};
	
	if (verbose) {
		for (let i = 0, items = iter$(self._script.locs.spans), len = items.length, pair; i < len; i++) {
			pair = items[i];
			if (pair[1] != null) {
				let jsstr = self._script.js.slice(pair[0],pair[1]).split("\n");
				let imbastr = sourceCode.slice(pair[2],pair[3]).split("\n");
				pair.push(jsstr[0]);
				pair.push(imbastr[0]);
			};
		};
		
		let superMap = {
			0: '\u2080',
			1: '\u2081',
			2: '\u2082',
			3: '\u2083',
			4: '\u2084',
			5: '\u2085',
			6: '\u2086',
			7: '\u2087',
			8: '\u2088',
			9: '\u2089',
			'|': '\u208C'
		};
		let repSuper = function(m,str) {
			return ("[" + str + "]");
			let o = '';
			let l = str.length;
			let i = 0;
			while (i < l){
				o += superMap[str[i++]];
			};
			return '\u208D' + o + '\u208E';
		};
		
		self._script.js = self._script.js + '\n/*\n' + prejs.replace(/\/\*\%([\w\|]*)?\$\*\//g,repSuper).replace(/\/\*/g,'**').replace(/\*\//g,'**') + '\n*/';
	};
	return self;
};

SourceMap.prototype.generate = function (){
	this.parse();
	
	var lastColumn = 1;
	var lastSourceLine = 1;
	var lastSourceColumn = 1;
	var buffer = "";
	
	for (let lineNumber = 0, items = iter$(this._maps), len = items.length, line; lineNumber < len; lineNumber++) {
		line = items[lineNumber];
		lastColumn = 1;
		
		for (let nr = 0, ary = iter$(line), len = ary.length, map; nr < len; nr++) {
			map = ary[nr];
			if (nr != 0) { buffer += ',' };
			var src = map[0];
			var dest = map[1];
			
			buffer += this.encodeVlq(dest[1] - lastColumn);
			lastColumn = dest[1];
			// add index
			buffer += this.encodeVlq(0);
			
			// The starting line in the original source, relative to the previous source line.
			buffer += this.encodeVlq(src[0] - lastSourceLine);
			lastSourceLine = src[0];
			// The starting column in the original source, relative to the previous column.
			buffer += this.encodeVlq(src[1] - lastSourceColumn);
			lastSourceColumn = src[1];
		};
		
		buffer += ";";
	};
	
	var rel = this._targetPath && path.relative(path.dirname(this._targetPath),this._sourcePath);
	
	var map = {
		version: 3,
		file: this.sourceName().replace(/\.imba/,'.js') || '',
		sourceRoot: this._sourceRoot || '',
		sources: [rel || this._sourcePath],
		sourcesContent: [this.sourceCode()],
		names: [],
		mappings: buffer
	// maps: @maps
	};
	
	if (this._options.sourcemap == 'inline') {
		map.file = this.sourceName();
		map.sources = [this.sourceName()];
	};
	
	this._result = map;
	return this;
};

SourceMap.prototype.inlined = function (){
	// maybe drop the sourcesContent
	try {
		var str = JSON.stringify(this._result);
		if (globalThis.Buffer) {
			str = Buffer.from(str,'utf-8').toString("base64");
		} else if (typeof btoa == 'function') {
			str = btoa(str);
		} else {
			
			return;
		};
		return ("\n//# sourceMappingURL=data:application/json;charset=utf-8;base64," + str);
	} catch (e) { };
	
	console.warn("base64 encoding not supported - skipping inline sourceMapping");
	return "";
};

// borrowed from CoffeeScript
SourceMap.prototype.encodeVlq = function (value){
	var answer = '';
	// Least significant bit represents the sign.
	var signBit = (value < 0) ? 1 : 0;
	var nextChunk;
	// The next bits are the actual value.
	var valueToEncode = (Math.abs(value) << 1) + signBit;
	// Make sure we encode at least one character, even if valueToEncode is 0.
	while (valueToEncode || !answer){
		nextChunk = valueToEncode & VLQ_VALUE_MASK;
		valueToEncode = valueToEncode >> VLQ_SHIFT;
		if (valueToEncode) {
			nextChunk |= VLQ_CONTINUATION_BIT;
		};
		
		answer += this.encodeBase64(nextChunk);
	};
	
	return answer;
};

SourceMap.prototype.toJSON = function (){
	return this._result;
};

SourceMap.prototype.encodeBase64 = function (value){
	return BASE64_CHARS[value]; // or throw Error.new("Cannot Base64 encode value: {value}")
};

export { SourceMap };
