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
		return camelCase(("set-" + sym));
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
		var $0 = arguments, i = $0.length;
		var locs = new Array(i>0 ? i : 0);
		while(i>0) locs[i-1] = $0[--i];
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
	}; exports.markLineColForTokens = markLineColForTokens;; return markLineColForTokens;

})();