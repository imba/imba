(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	
	var path = require('path');
	var util = require('./helpers');
	
	function SourceMap(source){
		this._source = source;
		this._maps = [];
		this._map = "";
		this._js = "";
	};
	
	exports.SourceMap = SourceMap; // export class 
	SourceMap.prototype.source = function (){
		return this._source;
	};
	
	SourceMap.prototype.options = function (){
		return this._source;
	};
	
	SourceMap.prototype.filename = function (){
		return this.options().options.filename;
	};
	
	SourceMap.prototype.sourceCode = function (){
		return this.options().options._source;
	};
	
	SourceMap.prototype.targetPath = function (){
		return this.options().options.targetPath;
	};
	
	SourceMap.prototype.sourcePath = function (){
		return this.options().options.sourcePath;
	};
	
	SourceMap.prototype.sourceName = function (){
		return path.basename(this.sourcePath());
	};
	
	SourceMap.prototype.targetName = function (){
		return path.basename(this.targetPath());
	};
	
	
	SourceMap.prototype.sourceFiles = function (){
		return [this.sourceName()];
	};
	
	SourceMap.prototype.parse = function (){
		var self=this;
		var matcher = /\%\$(\d*)\$\%/;
		var replacer = /^(.*?)\%\$(\d*)\$\%/;
		var lines = this.options().js.split(/\n/g); // what about js?
		// return self
		var locmap = util.locationToLineColMap(this.sourceCode());
		this._maps = [];
		
		
		
		var match;
		// split the code in lines. go through each line 
		// go through the code looking for LOC markers
		// remove markers along the way and keep track of
		for (var i=0, ary=iter$(lines), len=ary.length, line; i < len; i++) {
			// could split on these?
			line = ary[i];
			var col = 0;
			var caret = 0;
			
			this._maps[i] = [];
			while (line.match(matcher)){
				line = line.replace(replacer,function(m,pre,loc) {
					var lc = locmap[parseInt(loc)];
					caret = pre.length;
					var mapping = [[lc[0],lc[1]],[i,caret]]; // source and output
					self._maps[i].push(mapping);
					return pre;
				});
			};
			lines[i] = line;
		};
		
		// console.log source:js
		self.source().js = lines.join('\n');
		return self;
	};
	
	SourceMap.prototype.generate = function (){
		this.parse();
		
		var lastColumn = 0;
		var lastSourceLine = 0;
		var lastSourceColumn = 0;
		var buffer = "";
		
		for (var lineNumber=0, ary=iter$(this._maps), len=ary.length; lineNumber < len; lineNumber++) {
			lastColumn = 0;
			
			for (var nr=0, items=iter$(ary[lineNumber]), len_=items.length, map; nr < len_; nr++) {
				map = items[nr];
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
		
		var rel = path.relative(path.dirname(this.targetPath()),this.sourcePath());
		
		// console.log sourcePath, targetPath, rel
		
		var sourcemap = {
			version: 3,
			file: this.sourceName().replace(/\.imba/,'.js') || '',
			sourceRoot: this.options().sourceRoot || '',
			sources: [rel],
			sourcesContent: [this.sourceCode()],
			names: [],
			mappings: buffer
		};
		
		this.options().sourcemap = sourcemap;
		var base64 = new Buffer(JSON.stringify(sourcemap)).toString("base64");
		// var base64 = "data:application/json;base64,{base64}"
		// options:js += "\n//# sourceMappingURL={sourceName.replace(/\.imba$/,'.map')}"
		this.source().js += ("\n//# sourceMappingURL=data:application/json;base64," + base64);
		return this;
	};
	
	VLQ_SHIFT = 5;
	VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT;
	VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1;
	BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	
	// borrowed from CoffeeScript
	SourceMap.prototype.encodeVlq = function (value){
		var answer = '';
		// Least significant bit represents the sign.
		var signBit = value < 0 ? (1) : (0);
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
	
	SourceMap.prototype.encodeBase64 = function (value){
		return BASE64_CHARS[value]; // or throw Error.new("Cannot Base64 encode value: {value}")
	};
	return SourceMap;
	
	

})()