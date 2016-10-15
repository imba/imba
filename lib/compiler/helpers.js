(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	
	function brace(str){
		var lines = str.match(/\n/);
		// what about indentation?
		
		if (lines) {
			return '{' + str + '\n}';
		} else {
			return '{\n' + str + '\n}';
		};
	}; exports.brace = brace;
	
	function normalizeIndentation(str){
		var m;
		var reg = /\n+([^\n\S]*)/g;
		var ind = null;
		
		var length_;while (m = reg.exec(str)){
			var attempt = m[1];
			if (ind == null || 0 < (length_ = attempt.length) && length_ < ind.length) {
				ind = attempt;
			};
		};
		
		if (ind) { str = str.replace(RegExp(("\\n" + ind),"g"),'\n') };
		return str;
	}; exports.normalizeIndentation = normalizeIndentation;
	
	
	function flatten(arr){
		var out = [];
		arr.forEach(function(v) { return v instanceof Array ? (out.push.apply(out,flatten(v))) : (out.push(v)); });
		return out;
	}; exports.flatten = flatten;
	
	
	function pascalCase(str){
		return str.replace(/(^|[\-\_\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
	}; exports.pascalCase = pascalCase;
	
	function camelCase(str){
		str = String(str);
		// should add shortcut out
		return str.replace(/([\-\_\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
	}; exports.camelCase = camelCase;
	
	function dashToCamelCase(str){
		str = String(str);
		if (str.indexOf('-') >= 0) {
			// should add shortcut out
			str = str.replace(/([\-\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
		};
		return str;
	}; exports.dashToCamelCase = dashToCamelCase;
	
	function snakeCase(str){
		var str = str.replace(/([\-\s])(\w)/g,'_');
		return str.replace(/()([A-Z])/g,"_$1",function(m,v,l) { return l.toUpperCase(); });
	}; exports.snakeCase = snakeCase;
	
	function setterSym(sym){
		return dashToCamelCase(("set-" + sym));
	}; exports.setterSym = setterSym;
	
	function quote(str){
		return '"' + str + '"';
	}; exports.quote = quote;
	
	function singlequote(str){
		return "'" + str + "'";
	}; exports.singlequote = singlequote;
	
	function symbolize(str){
		str = String(str);
		var end = str.charAt(str.length - 1);
		
		if (end == '=') {
			str = 'set' + str[0].toUpperCase() + str.slice(1,-1);
		};
		
		if (str.indexOf("-") >= 0) {
			str = str.replace(/([\-\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
		};
		
		return str;
	}; exports.symbolize = symbolize;
	
	
	function indent(str){
		return String(str).replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	}; exports.indent = indent;
	
	function bracketize(str,ind){
		if(ind === undefined) ind = true;
		if (ind) { str = "\n" + indent(str) + "\n" };
		return '{' + str + '}';
	}; exports.bracketize = bracketize;
	
	function parenthesize(str){
		return '(' + String(str) + ')';
	}; exports.parenthesize = parenthesize;
	
	function unionOfLocations(){
		var $0 = arguments, j = $0.length;
		var locs = new Array(j>0 ? j : 0);
		while(j>0) locs[j-1] = $0[--j];
		var a = Infinity;
		var b = -Infinity;
		
		for (var i = 0, ary = iter$(locs), len = ary.length, loc; i < len; i++) {
			loc = ary[i];
			if (loc && loc._loc != undefined) {
				loc = loc._loc;
			};
			
			if (loc && (loc.loc instanceof Function)) {
				loc = loc.loc();
			};
			
			if (loc instanceof Array) {
				if (a > loc[0]) { a = loc[0] };
				if (b < loc[0]) { b = loc[1] };
			} else if ((typeof loc=='number'||loc instanceof Number)) {
				if (a > loc) { a = loc };
				if (b < loc) { b = loc };
			};
		};
		
		return [a,b];
	}; exports.unionOfLocations = unionOfLocations;
	
	
	
	function locationToLineColMap(code){
		var lines = code.split(/\n/g);
		var map = [];
		
		var chr;
		var loc = 0;
		var col = 0;
		var line = 0;
		
		while (chr = code[loc]){
			map[loc] = [line,col];
			
			if (chr == '\n') {
				line++;
				col = 0;
			} else {
				col++;
			};
			
			loc++;
		};
		
		return map;
	}; exports.locationToLineColMap = locationToLineColMap;
	
	function markLineColForTokens(tokens,code){
		return this;
	}; exports.markLineColForTokens = markLineColForTokens;
	
	function parseArgs(argv,o){
		var env_;
		if(o === undefined) o = {};
		var aliases = o.alias || (o.alias = {});
		var groups = o.groups || (o.groups = []);
		var schema = o.schema || {};
		
		schema.main = {};
		
		var options = {};
		var explicit = {};
		argv = argv || process.argv.slice(2);
		var curr = null;
		var i = 0;
		var m;
		
		while ((i < argv.length)){
			var arg = argv[i];
			i++;
			
			if (m = arg.match(/^\-([a-zA-Z]+)$/)) {
				curr = null;
				var chars = m[1].split('');
				
				for (var i1 = 0, ary = iter$(chars), len = ary.length, item; i1 < len; i1++) {
					// console.log "parsing {item} at {i}",aliases
					item = ary[i1];
					var key = aliases[item] || item;
					chars[i1] = key;
					options[key] = true;
				};
				
				if (chars.length == 1) {
					curr = chars;
				};
			} else if (m = arg.match(/^\-\-([a-z0-9\-\_A-Z]+)$/)) {
				var val = true;
				key = m[1];
				
				if (key.indexOf('no-') == 0) {
					key = key.substr(3);
					val = false;
				};
				
				for (var j = 0, items = iter$(groups), len_ = items.length, g; j < len_; j++) {
					g = items[j];
					if (key.substr(0,g.length) == g) {
						console.log('should be part of group');
					};
				};
				
				key = dashToCamelCase(key);
				
				options[key] = val;
				curr = key;
			} else {
				if (!(curr && schema[curr])) {
					curr = 'main';
				};
				
				if (arg.match(/^\d+$/)) {
					arg = parseInt(arg);
				};
				
				val = options[curr];
				if (val == true || val == false) {
					options[curr] = arg;
				} else if ((typeof val=='string'||val instanceof String) || (typeof val=='number'||val instanceof Number)) {
					options[curr] = [val].concat(arg);
				} else if (val instanceof Array) {
					val.push(arg);
				} else {
					options[curr] = arg;
				};
			};
		};
		
		
		if ((typeof (env_ = options.env)=='string'||env_ instanceof String)) {
			options[("ENV_" + (options.env))] = true;
		};
		
		return options;
	}; exports.parseArgs = parseArgs;
	
	var ansi = exports.ansi = {
		bold: function(text) { return '\u001b[1m' + text + '\u001b[22m'; },
		red: function(text) { return '\u001b[31m' + text + '\u001b[39m'; },
		green: function(text) { return '\u001b[32m' + text + '\u001b[39m'; },
		gray: function(text) { return '\u001b[90m' + text + '\u001b[39m'; },
		white: function(text) { return '\u001b[37m' + text + '\u001b[39m'; }
	};
	
	

})();