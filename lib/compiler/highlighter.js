(function(){


	var lexer = require('./lexer');
	
	/* @class Highlighter */
	function Highlighter(code,tokens,ast,options){
		if(options === undefined) options = {};
		this._code = code;
		this._tokens = tokens;
		this._ast = ast;
		this._options = options;
		return this;
	};
	
	exports.Highlighter = Highlighter; // export class 
	
	Highlighter.prototype.__options = {name: 'options'};
	Highlighter.prototype.options = function(v){ return this._options; }
	Highlighter.prototype.setOptions = function(v){ this._options = v; return this; };
	
	
	
	Highlighter.prototype.process = function (){
		var tok, m;
		var marked = require('marked');
		var str = this._code;
		var pos = this._tokens.length;
		
		var sections = [];
		
		try {
			this._ast.analyze({});
		} catch (e) {
			null;
		};
		
		var res = "";
		// should rather add onto another string instead of reslicing the same string on every iteration
		
		if (false) {
			while (tok = this._tokens[--pos]){
				if (tok._col == -1) { continue };
				var loc = tok._loc;
				var len = tok._len || tok._value.length;
				true;
				console.log(("token " + loc));
				str = str.substring(0,loc - 1) + '<a>' + str.substr(loc,len) + '</a>' + str.slice(loc + len);
			};
		};
		
		pos = 0;
		var caret = 0;
		
		var classes = {
			'+': 'op add math',
			'-': 'op sub math',
			'=': 'op eq',
			'/': 'op div math',
			'*': 'op mult math',
			'?': 'op ternary',
			',': 'comma',
			':': 'colon',
			'.': 'op dot',
			'?.': 'op qdot',
			'[': ['s','sbl'],
			']': ['s','sbr'],
			'math': 'op math',
			'forin': 'keyword in',
			'string': 'str',
			'compare': 'op compare',
			'herecomment': ['blockquote','comment'],
			'relation': 'keyword relation',
			'from': 'keyword from',
			'logic': 'keyword logic',
			'post_if': 'keyword if',
			'prop': 'keyword prop'
		};
		
		var OPEN = {
			'tag_start': 'tag',
			'selector_start': 'sel',
			'indent': '_indent',
			'(': 'paren',
			'{': 'curly',
			'[': 'square',
			'("': 'str'
		};
		
		var CLOSE = {
			'tag_end': 'tag',
			'selector_end': 'sel',
			'outdent': '_indent',
			')': 'paren',
			']': 'square',
			'}': 'curly',
			'")': 'str'
		};
		
		var open,close;
		
		function comments(sub){
			return sub.replace(/(\#)([^\n]*)/g,function(m,s,q) {
				// q = marked(q)
				// q = 
				return "<q><s>" + s + "</s>" + q + "</q>";
			});
		};
		
		function split(){
			this.groups().push({html: res});
			return res = "";
		};
		
		function addSection(content,pars){
			// if type == 'code'
			//	content = '<pre><code>' + content + '</code></pre>'
			if(!pars||pars.constructor !== Object) pars = {};
			var type = pars.type !== undefined ? pars.type : 'code';
			var reset = pars.reset !== undefined ? pars.reset : true;
			var section = {content: content,type: type};
			sections.push(section);
			if (reset) { res = "" };
			return section;
		};
		
		while (tok = this._tokens[pos++]){
			var next = this._tokens[pos];
			
			if (close) {
				res += "</i>";
				close = null;
			};
			
			var typ = tok._type.toLowerCase();
			loc = tok._loc;
			var val = tok._value;
			len = tok._len; // or tok.@value:length
			
			if (loc > caret) {
				var add = str.substring(caret,loc);
				res += comments(add);
				caret = loc;
			};
			
			
			close = CLOSE[typ];
			
			if (open = OPEN[typ]) {
				open = OPEN[val] || open;
				res += ("<i class='" + open + "'>");
			};
			
			// elif var close = CLOSE[typ]
			//	res += "</i>"
			//	# should close after?
			//	# either on the next 
			
			// adding some interpolators
			// if loc and val == '("'
			// 	res += '<i>'
			// elif loc and val == '")'
			// 	res += '</i>'
			
			if (len == 0 || typ == 'terminator' || typ == 'indent' || typ == 'outdent') {
				continue;
			};
			
			if (tok._col == -1) {
				continue;
			};
			
			var node = 'span';
			var content = str.substr(loc,len);
			var cls = classes[typ] || typ;
			
			if (cls instanceof Array) {
				node = cls[0];
				cls = cls[1];
			};
			
			cls = cls.split(" ");
			// console.log "adding token {tok.@type}"
			if (lexer.ALL_KEYWORDS.indexOf(typ) >= 0) {
				cls.unshift('keyword');
			};
			
			caret = loc + len;
			
			if (typ == 'identifier') {
				if (tok._variable) {
					// console.log "IS VARIABLEREF",tok.@value
					cls.push('_lvar');
					cls.push("ref-" + tok._variable._ref);
				} else if (m = tok._meta) {
					// console.log "META"
					if (m.type == 'ACCESS') { cls.push('access') };
				};
			};
			
			
			if (typ == 'herecomment') {
				addSection(res); // resetting
				content = content.replace(/(^\s*###\n*|\n*###\s*$)/g,'<s>$1</s>');
				// content = marked(content)
			};
			
			if (typ == 'string') {
				content = content.replace(/(^['"]|['"]$)/g,function(m) {
					return '<s>' + m + '</s>';
				});
			};
			
			res += ("<" + node + " class='" + (cls.join(" ")) + "'>") + content + ("</" + node + ">");
			
			if (typ == 'herecomment') {
				addSection(res,{type: 'comment'}); // reset here as well
			};
			
			// true
			// console.log "token {loc}"
			// str = str.substring(0,loc - 1) + '<a>' + str.substr(loc,len) + '</a>' + str.slice(loc + len)
		};
		
		if (caret < str.length - 1) {
			res += comments(str.slice(caret));
		};
		
		// split # convert to group?
		
		var json = {sections: []};
		
		addSection(res,{type: 'code'});
		
		var html = '';
		html += '<code>';
		
		for (var i=0, len_=sections.length, section; i < len_; i++) {
			section = sections[i];var out = section.content;
			html += ("<div class='" + (section.type) + " imbalang'>") + out + '</div>';
			// html += section:content # '<pre><code>' + group:html + '</code></pre>'
		};
		html += '</code>';
		
		if (!(this.options().bare)) {
			html = '<link rel="stylesheet" href="imba.css" media="screen"></link><script src="imba.js"></script>' + html + '<script src="hl.js"></script>';
		};
		
		return html;
	};
	


}())