(function(){


	// helper for subclassing
	function subclass$(obj,sup) {
		for (var k in sup) {
			if (sup.hasOwnProperty(k)) obj[k] = sup[k];
		};
		// obj.__super__ = sup;
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
	};
	;
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	/* @class ImportStatement */
	AST.ImportStatement = function ImportStatement(imports,source,ns){
		this._imports = imports;
		this._source = source;
		this._ns = ns;
		this;
	};
	
	subclass$(AST.ImportStatement,AST.Statement);
	
	AST.ImportStatement.prototype.__ns = {};
	AST.ImportStatement.prototype.ns = function(v){ return this._ns; }
	AST.ImportStatement.prototype.setNs = function(v){ this._ns = v; return this; };
	
	AST.ImportStatement.prototype.__imports = {};
	AST.ImportStatement.prototype.imports = function(v){ return this._imports; }
	AST.ImportStatement.prototype.setImports = function(v){ this._imports = v; return this; };
	
	AST.ImportStatement.prototype.__source = {};
	AST.ImportStatement.prototype.source = function(v){ return this._source; }
	AST.ImportStatement.prototype.setSource = function(v){ this._source = v; return this; };
	
	
	
	
	
	AST.ImportStatement.prototype.visit = function (){
		if(this._ns) {
			this._nsvar || (this._nsvar = this.scope__().register(this._ns,this));
		};
		return this;
	};
	
	
	AST.ImportStatement.prototype.js = function (){
		var req = CALL(new AST.Identifier("require"),[this.source()]);
		
		if(this._ns) {
			// must register ns as a real variable
			return ("var " + (this._nsvar.c()) + " = " + (req.c()));
		} else if(this._imports) {
			
			// create a require for the source, with a temporary name?
			var out = [req.cache().c()];
			
			for(var i=0, ary=iter$(this._imports), len=ary.length, imp; i < len; i++) {
				// we also need to register these imports as variables, no?
				imp = ary[i];var o = OP('=',imp,OP('.',req,imp));
				out.push(("var " + (o.c())));
			};
			
			return out;
		} else {
			return req.c();
		};
	};
	
	
	
	AST.ImportStatement.prototype.consume = function (node){
		return this;
	};
	


}())