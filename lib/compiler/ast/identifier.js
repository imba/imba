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
	
	/* @class Identifier */
	AST.Identifier = function Identifier(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Identifier,AST.ValueNode);
	
	AST.Identifier.prototype.__safechain = {};
	AST.Identifier.prototype.safechain = function(v){ return this._safechain; }
	AST.Identifier.prototype.setSafechain = function(v){ this._safechain = v; return this; };
	
	AST.Identifier.prototype.region = function (){
		return this.value()._region;
	};
	
	AST.Identifier.prototype.load = function (v){
		var val = ((v instanceof AST.Identifier) ? (v.value()) : (v));
		var len = val.length;
		// experimental way to include reserved-info
		// if v.match()
		if(val[len - 1] == '?') {
			// p "safechain identifier?!"
			this.setSafechain(true);
			val = val.substr(0,len - 1);
		};
		
		return val;
	};
	
	AST.Identifier.prototype.isValidIdentifier = function (){
		return true;
	};
	
	AST.Identifier.prototype.isReserved = function (){
		return this.value().reserved;
	};
	
	AST.Identifier.prototype.symbol = function (){
		return this._symbol || (this._symbol = this.value().c().toSymbol());
	};
	
	AST.Identifier.prototype.setter = function (){
		return this._setter || (this._setter = new AST.Identifier(("set-" + (this.value().c()))));
	};
	
	AST.Identifier.prototype.toSymbol = function (){
		return this.symbol();
	};
	
	AST.Identifier.prototype.toSetter = function (){
		return new AST.Symbol(("" + (this.value().c()) + "="));
	};
	
	AST.Identifier.prototype.js = function (){
		return this.symbol();
	};
	
	AST.Identifier.prototype.dump = function (){
		return {loc: this.region(),value: this.value()};
	};
	
	
	
	
	/* @class TagId */
	AST.TagId = function TagId(){ AST.Identifier.apply(this,arguments) };
	
	subclass$(AST.TagId,AST.Identifier);
	AST.TagId.prototype.js = function (){
		return "id$('" + (this.value().c()) + "')";
	};
	
	
	// This is not an identifier - it is really a string
	// Is this not a literal?
	
	// FIXME Rename to IvarLiteral? or simply Literal with type Ivar
	/* @class Ivar */
	AST.Ivar = function Ivar(){ AST.Identifier.apply(this,arguments) };
	
	subclass$(AST.Ivar,AST.Identifier);
	AST.Ivar.prototype.name = function (){
		return this.value().c().camelCase().replace(/^@/,'');
	};
	// the @ should possibly be gone from the start?
	AST.Ivar.prototype.js = function (){
		return this.value().c().camelCase().replace(/^@/,'_');
	};
	
	
	// Ambiguous - We need to be consistent about Const vs ConstAccess
	// Becomes more important when we implement typeinference and code-analysis
	/* @class Const */
	AST.Const = function Const(){ AST.Identifier.apply(this,arguments) };
	
	subclass$(AST.Const,AST.Identifier);
	
	
	
	/* @class TagTypeIdentifier */
	AST.TagTypeIdentifier = function TagTypeIdentifier(){ AST.Identifier.apply(this,arguments) };
	
	subclass$(AST.TagTypeIdentifier,AST.Identifier);
	
	AST.TagTypeIdentifier.prototype.__name = {};
	AST.TagTypeIdentifier.prototype.name = function(v){ return this._name; }
	AST.TagTypeIdentifier.prototype.setName = function(v){ this._name = v; return this; };
	
	AST.TagTypeIdentifier.prototype.__ns = {};
	AST.TagTypeIdentifier.prototype.ns = function(v){ return this._ns; }
	AST.TagTypeIdentifier.prototype.setNs = function(v){ this._ns = v; return this; };
	
	AST.TagTypeIdentifier.prototype.load = function (val){
		var parts = val.split(":");
		this._raw = val;
		this._name = parts.pop();
		this._ns = parts.shift();// if any?
		return val.toLowerCase();
	};
	
	AST.TagTypeIdentifier.prototype.js = function (){
		// p "tagtypeidentifier.js {self}"
		return ("IMBA_TAGS." + (this._raw.replace(":","$")));
	};
	
	AST.TagTypeIdentifier.prototype.func = function (){
		var name = this._name.replace(/-/g,'_').replace(/\#/,'');// hmm
		if(this._ns) {
			name += ("$" + (this._ns.toLowerCase()));
		};
		return name;
	};
	
	AST.TagTypeIdentifier.prototype.id = function (){
		var m = this._raw.match(/\#([\w\-\d\_]+)\b/);
		return (m) ? (m[1]) : (null);
	};
	
	
	AST.TagTypeIdentifier.prototype.flag = function (){
		return "_" + this.name().replace(/--/g,'_').toLowerCase();
	};
	
	AST.TagTypeIdentifier.prototype.sel = function (){
		return "." + this.flag();// + name.replace(/-/g,'_').toLowerCase
	};
	
	AST.TagTypeIdentifier.prototype.string = function (){
		return this.value();
	};
	
	
	
	/* @class Argvar */
	AST.Argvar = function Argvar(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Argvar,AST.ValueNode);
	AST.Argvar.prototype.c = function (){
		// NEXT -- global.parseInt or Number.parseInt (better)
		var v = global.parseInt(this.value());
		
		// FIXME Not needed anymore? I think the lexer handles this
		if(v == 0) {
			return "arguments";
		};
		
		var s = this.scope__();
		// params need to go up to the closeste method-scope
		var par = s.params().at(this.value() - 1,true);
		return "" + (par.name().c());
	};
	


}())