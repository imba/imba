(function(){
	
	var lexer = require('./lexer');
	var imba = require('./compiler');
	
	var classes = {
		'+': '_imop op add math',
		'++': '_imop op incr math',
		'--': '_imop op decr math',
		'-': '_imop op sub math',
		'=': '_imop op eq',
		'/': '_imop op div math',
		'*': '_imop op mult math',
		'?': '_imop op ternary',
		',': '_imop comma',
		':': '_imop op colon',
		'.': '_imop op dot',
		'.:': '_imop op cdot',
		'?.': '_imop op qdot',
		'[': ['s','_imopen sb sbl'],
		']': ['s','_imclose sb sbr'],
		'(': ['s','_imopen rb rbl'],
		')': ['s','_imclose rb rbr'],
		'{': ['s','_imopen cb cbl'],
		'}': ['s','_imclose cb cbr'],
		'call_start': ['s','_imopen call rb rbl'],
		'call_end': ['s','_imclose call rb rbr'],
		'tag_start': ['s','_imopen tag_open'],
		'tag_end': ['s','_imclose tag_close'],
		
		'compound_assign': 'op assign compound',
		'str': '_imstr string',
		'num': '_imnum number',
		'string': '_imstr string',
		'number': '_imnum number',
		'math': '_imop op math',
		'forin': 'keyword in',
		'forof': 'keyword of',
		'own': 'keyword own',
		'compare': '_imop op compare',
		'herecomment': ['blockquote','comment'],
		'relation': 'keyword relation',
		'export': 'keyword export',
		'global': 'keyword global',
		'extern': 'keyword global',
		'extend': 'keyword extend',
		'require': 'keyword require',
		'from': 'keyword from',
		'logic': 'keyword logic',
		'post_if': 'keyword if post_if',
		'post_for': 'keyword for post_for',
		'prop': 'keyword prop',
		'attr': 'keyword attr'
	};
	
	function Highlighter(code,tokens,ast,options){
		if(options === undefined) options = {};
		this._code = code;
		this._tokens = tokens;
		this._ast = ast;
		this._options = options;
		this._options.nextVarCounter || (this._options.nextVarCounter = 0);
		this._varRefs = {};
		return this;
	};
	
	exports.Highlighter = Highlighter; // export class 
	
	Highlighter.prototype.__options = {name: 'options'};
	Highlighter.prototype.options = function(v){ return this._options; }
	Highlighter.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Highlighter.prototype.varRef = function (variable){
		var $1;
		var i = this._options.nested;
		var pfx = i ? ('i') : ('');
		// @options:nextVarCounter
		// will stick - no
		return this._varRefs[($1=variable._ref)] || (this._varRefs[$1] = (pfx + this._options.nextVarCounter++));
	};
	
	Highlighter.prototype.process = function (){
		var self=this, tok;
		var o = self.options();
		var marked = require('marked');
		// var hljs = require 'highlight.js'
		// hljs.configure classPrefix: ''
		
		// don't create this every time
		var mdrenderer = new marked.Renderer();
		mdrenderer.heading = function(text,level) { return '<h' + level + '><span>' + text + '</span></h' + level + '>'; };
		
		marked.setOptions(
			{highlight: function(code,language) {
				if (!code.match(/^\s*\>/)) language || (language = 'imba');
				console.log("highlighting here!",code,language);
				
				if (language == 'imba') {
					var out = imba.highlight(code,{bare: true,nested: true});
					return out;
				} else {
					return out;
				};
				
				return self.hljs().highlightAuto(code).value;
			}}
		);
		
		// console.log(marked('```js\n console.log("hello"); \n```'))
		
		var str = self._code;
		var pos = self._tokens.length;
		
		// var nextVarRef = 0
		// var varRefs = {}
		
		var sections = [];
		
		if (self._ast) {
			try {
				self._ast.analyze({});
			} catch (e) {
				null;
			};
		};
		
		var res = "";
		pos = 0;
		var caret = 0;
		
		
		
		var OPEN = {
			'tag_start': '_imtag tag',
			'selector_start': '_imsel sel',
			'index_start': 'index',
			'indent': '_indent',
			'(': '_imparens paren',
			'{': '_imcurly curly',
			'[': '_imsquare square',
			'("': '_iminterstr string'
		};
		
		var CLOSE = {
			'tag_end': 'tag',
			'selector_end': 'sel',
			'index_end': 'index',
			'outdent': '_indent',
			')': 'paren',
			']': 'square',
			'}': 'curly',
			'")': 'string'
		};
		
		var open,close;
		
		function comments(sub){
			if (o.plain) { return sub };
			
			return sub.replace(/(\#)([^\n]*)/g,function(m,s,q) {
				// q = marked(q)
				// q = 
				q = marked.inlineLexer(q,[],{});
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
		
		while (tok = self._tokens[pos++]){
			var next = self._tokens[pos];
			
			if (close) {
				res += "</i>";
				close = null;
			};
			
			var typ = tok._type.toLowerCase();
			var loc = tok._loc;
			var val = tok._value;
			var len = tok._len; // or tok.@value:length
			var meta = tok._meta;
			
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
			// temporary workaround until we redefine require as an identifier
			if (typ == 'const' && content == 'require') {
				typ = 'require';
			};
			
			
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
			
			// if tok.@variable
			// 	console.log "found variable {tok.@variable}"
			
			if (typ == 'identifier') {
				if (content[0] == '#') {
					cls.push('idref');
				} else {
					cls.unshift('_imtok');
				};
				
				if (meta) {
					// console.log "META"
					if (meta.type == 'ACCESS') { cls.push('access') };
				};
			};
			
			
			if (tok._variable) {
				// console.log "IS VARIABLEREF",tok.@value
				cls.push('_lvar');
				var ref = self.varRef(tok._variable);
				cls.push("ref-" + ref);
			};
			
			if (typ == 'herecomment' && !o.plain) {
				addSection(res); // resetting
				
				// content = content.replace(/(^\s*###\n*|\n*###\s*$)/g,'<s>$1</s>')
				content = content.replace(/(^\s*###[\s\n]*|[\n\s]*###\s*$)/g,'');
				// console.log("converting to markdown",content)
				content = marked(content,{renderer: mdrenderer});
				res += '<s>###</s>' + content + '<s>###</s>';
				addSection(res,{type: 'comment'});
				continue;
				// console.log("converted",content)
				// content = marked(content)
			};
			
			if (typ == 'string') {
				if (content.match(/^['"]?\.?\.\//)) { cls.push('pathname') };
				// dont do this anymore
				// content = content.replace(/(^['"]|['"]$)/g) do |m| '<s>' + m + '</s>'
			};
			var clstr = cls.join(" ");
			if (!clstr.match(/\b\_/)) { clstr = '_imtok ' + clstr };
			
			res += ("<" + node + " class='" + clstr + "'>") + content + ("</" + node + ">");
			
			
			// true
			// console.log "token {loc}"
			// str = str.substring(0,loc - 1) + '<a>' + str.substr(loc,len) + '</a>' + str.slice(loc + len)
		};
		
		// close after?
		if (close) {
			res += "</i>";
			close = null;
		};
		
		if (caret < str.length - 1) {
			res += comments(str.slice(caret));
		};
		
		if (self._tokens.length == 0) {
			res = self._code;
		};
		// split # convert to group?
		
		var json = {sections: []};
		
		// no sections - only code - straight out
		if (o.plain) {
			return res;
		};
		
		addSection(res,{type: 'code'});
		
		var html = '';
		// html += '<code>'
		
		if (self.options().json) {
			return sections;
		};
		
		for (var i=0, len_=sections.length, section; i < len_; i++) {
			section = sections[i];
			var out = section.content;
			typ = {code: 'code',comment: 'blockquote'}[section.type] || 'div';
			html += ("<" + typ + " class='" + (section.type) + " imbalang'>") + out + ("</" + typ + ">");
			// html += section:content # '<pre><code>' + group:html + '</code></pre>'
		};
		// html += '</code>'
		
		if (!self.options().bare) {
			html = '<link rel="stylesheet" href="imba.css" media="screen"></link><script src="imba.js"></script>' + html + '<script src="hl.js"></script>';
		};
		
		return html;
	};

})()