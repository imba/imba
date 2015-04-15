(function(){


	function brace(str){
		var lines = str.match(/\n/);
		// what about indentation?
		
		return (lines) ? (
			'{' + str + '\n}'
		) : (
			'{\n' + str + '\n}'
		);
	}; exports.brace = brace;
	
	function flatten(arr){
		var out = [];
		arr.forEach(function (v){
			return (v instanceof Array) ? (out.push.apply(out,flatten(v))) : (out.push(v));
		});
		return out;
	}; exports.flatten = flatten;
	
	
	function pascalCase(str){
		return str.replace(/(^|[\-\_\s])(\w)/g,function (m,v,l){
			return l.toUpperCase();
		});
	}; exports.pascalCase = pascalCase;
	
	function camelCase(str){
		return String(str).replace(/([\-\_\s])(\w)/g,function (m,v,l){
			return l.toUpperCase();
		});
	}; exports.camelCase = camelCase;
	
	function snakeCase(str){
		var str = str.replace(/([\-\s])(\w)/g,'_');
		return str.replace(/()([A-Z])/g,"_$1",function (m,v,l){
			return l.toUpperCase();
		});
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
		var sym = String(str).replace(/(.+)\=$/,"set-$1");
		sym = sym.replace(/(.+)\?$/,"is-$1");
		sym = sym.replace(/([\-\s])(\w)/g,function (m,v,l){
			return l.toUpperCase();
		});
		return sym;
	}; exports.symbolize = symbolize;
	
	function indent(str){
		return String(str).replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	}; exports.indent = indent;
	
	function bracketize(str,ind){
		if(ind === undefined) ind = true;
		if(ind) {
			str = "\n" + indent(str) + "\n";
		};
		return '{' + str + '}';
	}; exports.bracketize = bracketize;
	
	function parenthesize(str){
		return '(' + String(str) + ')';
	}; exports.parenthesize = parenthesize;


}())