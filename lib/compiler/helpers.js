function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {};

var ansiMap = {
	reset: [0,0],
	bold: [1,22],
	dim: [2,22],
	italic: [3,23],
	underline: [4,24],
	inverse: [7,27],
	hidden: [8,28],
	strikethrough: [9,29],
	
	black: [30,39],
	red: [31,39],
	green: [32,39],
	yellow: [33,39],
	blue: [34,39],
	magenta: [35,39],
	cyan: [36,39],
	white: [37,39],
	gray: [90,39],
	
	redBright: [91,39],
	greenBright: [92,39],
	yellowBright: [93,39],
	blueBright: [94,39],
	magentaBright: [95,39],
	cyanBright: [96,39],
	whiteBright: [97,39]
};

var ansi = exports.ansi = {
	bold: function(text) { return '\u001b[1m' + text + '\u001b[22m'; },
	red: function(text) { return '\u001b[31m' + text + '\u001b[39m'; },
	green: function(text) { return '\u001b[32m' + text + '\u001b[39m'; },
	yellow: function(text) { return '\u001b[33m' + text + '\u001b[39m'; },
	gray: function(text) { return '\u001b[90m' + text + '\u001b[39m'; },
	white: function(text) { return '\u001b[37m' + text + '\u001b[39m'; },
	f: function(name,text) {
		var pair = ansiMap[name];
		return '\u001b[' + pair[0] + 'm' + text + '\u001b[' + pair[1] + 'm';
	}
};

ansi.warn = ansi.yellow;
ansi.error = ansi.red;

exports.brace = self.brace = function (str){
	var lines = str.match(/\n/);
	// what about indentation?
	
	if (lines) {
		return '{' + str + '\n}';
	} else {
		return '{\n' + str + '\n}';
	};
};

exports.normalizeIndentation = self.normalizeIndentation = function (str){
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
};


exports.flatten = self.flatten = function (arr){
	var out = [];
	arr.forEach(function(v) { return (v instanceof Array) ? out.push.apply(out,self.flatten(v)) : out.push(v); });
	return out;
};


exports.pascalCase = self.pascalCase = function (str){
	return str.replace(/(^|[\-\_\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
};

exports.camelCase = self.camelCase = function (str){
	str = String(str);
	// should add shortcut out
	return str.replace(/([\-\_\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
};

exports.dashToCamelCase = self.dashToCamelCase = function (str){
	str = String(str);
	if (str.indexOf('-') >= 0) {
		// should add shortcut out
		str = str.replace(/([\-\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
	};
	return str;
};

exports.snakeCase = self.snakeCase = function (str){
	var str = str.replace(/([\-\s])(\w)/g,'_');
	return str.replace(/()([A-Z])/g,"_$1",function(m,v,l) { return l.toUpperCase(); });
};

exports.setterSym = self.setterSym = function (sym){
	return self.dashToCamelCase(("set-" + sym));
};

exports.quote = self.quote = function (str){
	return '"' + str + '"';
};

exports.singlequote = self.singlequote = function (str){
	return "'" + str + "'";
};

exports.symbolize = self.symbolize = function (str){
	str = String(str);
	var end = str.charAt(str.length - 1);
	
	if (end == '=') {
		str = 'set' + str[0].toUpperCase() + str.slice(1,-1);
	};
	
	if (str.indexOf("-") >= 0) {
		str = str.replace(/([\-\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
	};
	
	return str;
};


exports.indent = self.indent = function (str){
	return String(str).replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
};

exports.bracketize = self.bracketize = function (str,ind){
	if(ind === undefined) ind = true;
	if (ind) { str = "\n" + self.indent(str) + "\n" };
	return '{' + str + '}';
};

exports.parenthesize = self.parenthesize = function (str){
	return '(' + String(str) + ')';
};

exports.unionOfLocations = self.unionOfLocations = function (){
	var $0 = arguments, j = $0.length;
	var locs = new Array(j>0 ? j : 0);
	while(j>0) locs[j-1] = $0[--j];
	var a = Infinity;
	var b = -Infinity;
	
	for (var i = 0, items = iter$(locs), len = items.length, loc; i < len; i++) {
		loc = items[i];
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
};



exports.locationToLineColMap = self.locationToLineColMap = function (code){
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
};

exports.markLineColForTokens = self.markLineColForTokens = function (tokens,code){
	return self;
};

exports.parseArgs = self.parseArgs = function (argv,o){
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
			
			for (var i1 = 0, items = iter$(chars), len = items.length, item; i1 < len; i1++) {
				// console.log "parsing {item} at {i}",aliases
				item = items[i1];
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
			
			for (var j = 0, ary = iter$(groups), len_ = ary.length, g; j < len_; j++) {
				g = ary[j];
				if (key.substr(0,g.length) == g) {
					console.log('should be part of group');
				};
			};
			
			key = self.dashToCamelCase(key);
			
			options[key] = val;
			curr = key;
		} else {
			var desc = schema[curr];
			
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
			
			if (!(desc && desc.multi)) {
				curr = 'main';
			};
		};
	};
	
	if ((typeof (env_ = options.env)=='string'||env_ instanceof String)) {
		options[("ENV_" + (options.env))] = true;
	};
	
	return options;
};

exports.printExcerpt = self.printExcerpt = function (code,loc,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var hl = pars.hl !== undefined ? pars.hl : false;
	var gutter = pars.gutter !== undefined ? pars.gutter : true;
	var type = pars.type !== undefined ? pars.type : 'warn';
	var pad = pars.pad !== undefined ? pars.pad : 2;
	var lines = code.split(/\n/g);
	var locmap = self.locationToLineColMap(code);
	var lc = locmap[loc[0]] || [0,0];
	var ln = lc[0];
	var col = lc[1];
	var line = lines[ln];
	
	var ln0 = Math.max(0,ln - pad);
	var ln1 = Math.min(ln0 + pad + 1 + pad,lines.length);
	var lni = ln - ln0;
	var l = ln0;
	
	var res1 = [];while (l < ln1){
		res1.push(lines[l++]);
	};var out = res1;
	
	if (gutter) {
		out = out.map(function(line,i) {
			var prefix = ("" + (ln0 + i + 1));
			var str;
			while (prefix.length < String(ln1).length){
				prefix = (" " + prefix);
			};
			if (i == lni) {
				str = ("   -> " + prefix + " | " + line);
				if (hl) { str = ansi.f(hl,str) };
			} else {
				str = ("      " + prefix + " | " + line);
				if (hl) { str = ansi.f('gray',str) };
			};
			return str;
		});
	};
	
	// if colors isa String
	// 	out[lni] = ansi.f(colors,out[lni])
	// elif colors
	// 	let color = ansi[type] or ansi:red
	// 	out[lni] = color(out[lni])
	
	var res = out.join('\n');
	return res;
};

exports.printWarning = self.printWarning = function (code,warn){
	var msg = warn.message; // b("{yellow('warn: ')}") + yellow(warn:message)
	var excerpt = self.printExcerpt(code,warn.loc,{hl: 'whiteBright',type: 'warn',pad: 1});
	return msg + '\n' + excerpt;
};




