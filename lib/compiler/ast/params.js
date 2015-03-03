(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
AST.Param = imba$class(function Param(name,defaults,typ){
	this._name = name;
	this._defaults = defaults;
	this._typ = typ;
	this._variable = null;
},AST.Node);

AST.Param.prototype.__name = {};
AST.Param.prototype.name = function(v){ return this._name; }
AST.Param.prototype.setName = function(v){ this._name = v; return this; }
;

AST.Param.prototype.__index = {};
AST.Param.prototype.index = function(v){ return this._index; }
AST.Param.prototype.setIndex = function(v){ this._index = v; return this; }
;

AST.Param.prototype.__defaults = {};
AST.Param.prototype.defaults = function(v){ return this._defaults; }
AST.Param.prototype.setDefaults = function(v){ this._defaults = v; return this; }
;

AST.Param.prototype.__splat = {};
AST.Param.prototype.splat = function(v){ return this._splat; }
AST.Param.prototype.setSplat = function(v){ this._splat = v; return this; }
;

AST.Param.prototype.__variable = {};
AST.Param.prototype.variable = function(v){ return this._variable; }
AST.Param.prototype.setVariable = function(v){ this._variable = v; return this; }
;

AST.Param.prototype.js = function (){
	if(this._variable) {
		return this._variable.c();
	};
	
	return (this.defaults()) && (("if(" + (this.name().c()) + " == null) " + (this.name().c()) + " = " + (this.defaults().c())));
};
AST.Param.prototype.visit = function (){
	var variable_, v_;
	if(this._defaults) {
		this._defaults.traverse();
	};
	(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),this)), v_));
	return this;
};
AST.Param.prototype.assignment = function (){
	return OP('=',this.variable().accessor(),this.defaults());
};
AST.Param.prototype.isExpressable = function (){
	return !this.defaults() || this.defaults().isExpressable();
};
AST.Param.prototype.dump = function (){
	return {loc: this.loc()};
};
AST.Param.prototype.loc = function (){
	return this._name && this._name.region();
};
AST.SplatParam = imba$class(function SplatParam(){
	AST.Param.apply(this,arguments);
},AST.Param);
AST.SplatParam.prototype.loc = function (){
	var r = this.name().region();
	return [r[0] - 1, r[1]];
};
AST.BlockParam = imba$class(function BlockParam(){
	AST.Param.apply(this,arguments);
},AST.Param);
AST.BlockParam.prototype.c = function (){
	return "blockparam";
};
AST.BlockParam.prototype.loc = function (){
	var r = this.name().region();
	return [r[0] - 1, r[1]];
};
AST.OptionalParam = imba$class(function OptionalParam(){
	AST.Param.apply(this,arguments);
},AST.Param);

AST.NamedParam = imba$class(function NamedParam(){
	AST.Param.apply(this,arguments);
},AST.Param);



AST.RequiredParam = imba$class(function RequiredParam(){
	AST.Param.apply(this,arguments);
},AST.Param);


AST.NamedParams = imba$class(function NamedParams(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);

AST.NamedParams.prototype.__index = {};
AST.NamedParams.prototype.index = function(v){ return this._index; }
AST.NamedParams.prototype.setIndex = function(v){ this._index = v; return this; }
;

AST.NamedParams.prototype.__variable = {};
AST.NamedParams.prototype.variable = function(v){ return this._variable; }
AST.NamedParams.prototype.setVariable = function(v){ this._variable = v; return this; }
;

AST.NamedParams.prototype.load = function (list){
	var load = (function (k){
		return new AST.NamedParam(k.key(),k.value());
	});
	return (list instanceof AST.Obj) ? (list.value().map(load)) : (list);
};
AST.NamedParams.prototype.visit = function (){
	var s = this.scope__();
	this._variable || (this._variable = s.temporary(this,{type: 'keypars'}));
	this._variable.predeclared();
	AST.NamedParams.prototype.__super.visit.apply(this,arguments);
	return this;
};
AST.NamedParams.prototype.name = function (){
	return this.variable().c();
};
AST.NamedParams.prototype.js = function (){
	return "namedpar";
};
AST.IndexedParam = imba$class(function IndexedParam(){
	AST.Param.apply(this,arguments);
},AST.Param);

AST.IndexedParam.prototype.__parent = {};
AST.IndexedParam.prototype.parent = function(v){ return this._parent; }
AST.IndexedParam.prototype.setParent = function(v){ this._parent = v; return this; }
;

AST.IndexedParam.prototype.__subindex = {};
AST.IndexedParam.prototype.subindex = function(v){ return this._subindex; }
AST.IndexedParam.prototype.setSubindex = function(v){ this._subindex = v; return this; }
;

AST.IndexedParam.prototype.visit = function (){
	var variable_, v_;
	(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),this)), v_));
	this.variable().proxy(this.parent().variable(),this.subindex());
	return this;
};
AST.ArrayParams = imba$class(function ArrayParams(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);

AST.ArrayParams.prototype.__index = {};
AST.ArrayParams.prototype.index = function(v){ return this._index; }
AST.ArrayParams.prototype.setIndex = function(v){ this._index = v; return this; }
;

AST.ArrayParams.prototype.__variable = {};
AST.ArrayParams.prototype.variable = function(v){ return this._variable; }
AST.ArrayParams.prototype.setVariable = function(v){ this._variable = v; return this; }
;

AST.ArrayParams.prototype.visit = function (){
	var s = this.scope__();
	this._variable || (this._variable = s.temporary(this,{type: 'keypars'}));
	this._variable.predeclared();
	return AST.ArrayParams.prototype.__super.visit.apply(this,arguments);
};
AST.ArrayParams.prototype.name = function (){
	return this.variable().c();
};
AST.ArrayParams.prototype.load = function (list){
	var self=this;
	if(!((list instanceof AST.Arr))) {
		return null;
	};
	return (!(list.splat())) && (list.value().map(function (v,i){
		var name = v;
		if(v instanceof AST.VarOrAccess) {
			name = v.value().value();
		};
		return self.parse(name,v,i);
	}));
};
AST.ArrayParams.prototype.parse = function (name,child,i){
	var param = new AST.IndexedParam(name,null);
	
	param.setParent(this);
	param.setSubindex(i);
	return param;
};
AST.ArrayParams.prototype.head = function (ast){
	return this;
};
AST.ParamList = imba$class(function ParamList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);

AST.ParamList.prototype.__splat = {};
AST.ParamList.prototype.splat = function(v){ return this._splat; }
AST.ParamList.prototype.setSplat = function(v){ this._splat = v; return this; }
;

AST.ParamList.prototype.__block = {};
AST.ParamList.prototype.block = function(v){ return this._block; }
AST.ParamList.prototype.setBlock = function(v){ this._block = v; return this; }
;

AST.ParamList.prototype.at = function (index,force,name){
	if(force === undefined) force = false;
	if(name === undefined) name = null;
	if(force) {
		while(this.count() <= index){
			this.add(new AST.Param(this.count() == index && name || ("_" + this.count())));
		};
	};
	return this.list()[index];
};
AST.ParamList.prototype.visit = function (){
	this._splat = this.filter(function (par){
		return par instanceof AST.SplatParam;
	})[0];
	var blk = this.filter(AST.BlockParam);
	
	if(blk.count() > 1) {
		blk[1].warn("a method can only have one &block parameter");
	} else {
		if(blk[0] && blk[0] != this.last()) {
			blk[0].warn("&block must be the last parameter of a method");
		}
	};
	return AST.ParamList.prototype.__super.visit.apply(this,arguments);
};
AST.ParamList.prototype.js = function (o){
	if(this.count() == 0) {
		return AST.EMPTY;
	};
	if(o.parent() instanceof AST.Block) {
		return this.head(o);
	};
	
	if(o.parent() instanceof AST.Code) {
		var pars = this.nodes();
		if(this._splat) {
			pars = this.filter(function (arg){
				return (arg instanceof AST.RequiredParam) || (arg instanceof AST.OptionalParam);
			});
		};
		return pars.map(function (arg){
			return arg.name().c();
		}).compact().join(",");
	} else {
		throw "not implemented paramlist js";
		return "ta" + this.map(function (arg){
			return arg.c();
		}).compact().join(",");
	};
};
AST.ParamList.prototype.head = function (o){
	var reg = [];
	var opt = [];
	var blk = null;
	var splat = null;
	var named = null;
	var arys = [];
	var signature = [];
	var idx = 0;
	
	this.nodes().forEach(function (par,i){
		par.setIndex(idx);
		if(par instanceof AST.NamedParams) {
			signature.push('named');
			named = par;
		} else {
			if(par instanceof AST.OptionalParam) {
				signature.push('opt');
				opt.push(par);
			} else {
				if(par instanceof AST.BlockParam) {
					signature.push('blk');
					blk = par;
				} else {
					if(par instanceof AST.SplatParam) {
						signature.push('splat');
						splat = par;
						idx -= 1;
					} else {
						if(par instanceof AST.ArrayParams) {
							arys.push(par);
							signature.push('ary');
						} else {
							signature.push('reg');
							reg.push(par);
						}
					}
				}
			}
		};
		return idx++;
	});
	if(named) {
		var namedvar = named.variable();
	};
	var ast = [];
	var isFunc = function (js){
		return "typeof " + js + " == 'function'";
	};
	var isObj = function (js){
		return "" + js + ".constructor === Object";
	};
	var isntObj = function (js){
		return "" + js + ".constructor !== Object";
	};
	if(!named && !splat && !blk && opt.count() > 0 && signature.join(" ").match(/opt$/)) {
		for(var i=0, ary=iter$(opt), len_=ary.length, par; i < len_; i++){
			par = ary[i];
			ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
		};
	} else {
		if(named && !splat && !blk && opt.count() == 0) {
			ast.push(("if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
		} else {
			if(blk && opt.count() == 1 && !splat && !named) {
				var op = opt[0];
				var opn = op.name().c();
				var bn = blk.name().c();
				ast.push(("if(" + bn + "==undefined && " + (isFunc(opn)) + ") " + bn + " = " + opn + "," + opn + " = " + (op.defaults().c())));
			} else {
				if(blk && named && opt.count() == 0 && !splat) {
					bn = blk.name().c();
					ast.push(("if(" + bn + "==undefined && " + (isFunc(namedvar.c())) + ") " + bn + " = " + (namedvar.c()) + "," + (namedvar.c()) + " = \{\}"));
					ast.push(("else if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
				} else {
					if(opt.count() > 0 || splat) {
						var argvar = this.scope__().temporary(this,{type: 'arguments'}).predeclared().c();
						var len = this.scope__().temporary(this,{type: 'counter'}).predeclared().c();
						
						var last = ("" + argvar + "[" + len + "-1]");
						var pop = ("" + argvar + "[--" + len + "]");
						ast.push(("var " + argvar + " = arguments, " + len + " = " + argvar + ".length"));
						
						if(blk) {
							bn = blk.name().c();
							if(splat) {
								ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
							} else {
								if(reg.count() > 0) {
									ast.push(("var " + bn + " = " + len + " > " + (reg.count()) + " && " + (isFunc(last)) + " ? " + pop + " : null"));
								} else {
									ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
								}
							};
						};
						if(named) {
							ast.push(("var " + (namedvar.c()) + " = " + last + "&&" + (isObj(last)) + " ? " + pop + " : \{\}"));
						};
						for(var i=0, ary=iter$(opt), len_=ary.length, par; i < len_; i++){
							par = ary[i];
							ast.push(("if(" + len + " < " + (par.index() + 1) + ") " + (par.name().c()) + " = " + (par.defaults().c())));
						};
						if(splat) {
							var sn = splat.name().c();
							var si = splat.index();
							
							if(si == 0) {
								ast.push(("var " + sn + " = new Array(" + len + ">" + si + " ? " + len + " : 0)"));
								ast.push(("while(" + len + ">" + si + ") " + sn + "[" + len + "-1] = " + pop));
							} else {
								ast.push(("var " + sn + " = new Array(" + len + ">" + si + " ? " + len + "-" + si + " : 0)"));
								ast.push(("while(" + len + ">" + si + ") " + sn + "[--" + len + " - " + si + "] = " + argvar + "[" + len + "]"));
							};
						};
					} else {
						if(opt.count() > 0) {
							for(var i=0, ary=iter$(opt), len_=ary.length, par; i < len_; i++){
								par = ary[i];
								ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
							};
						}
					}
				}
			}
		}
	};
	if(named) {
		for(var i=0, ary=iter$(named.nodes()), len_=ary.length, k; i < len_; i++){
			k = ary[i];
			var op = OP('.',namedvar,k.c().toAST()).c();
			ast.push(("var " + (k.c()) + " = " + op + " !== undefined ? " + op + " : " + (k.defaults().c())));
		};
	};
	if(arys.length) {
		for(var i=0, ary=iter$(arys), len_=ary.length; i < len_; i++){
			this.p("adding arrayparams");
			ary[i].head(o,ast,this);
		};
	};
	return (ast.count() > 0) ? ((ast.join(";\n") + ";")) : (AST.EMPTY);
};
AST.VariableDeclaration = imba$class(function VariableDeclaration(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);

AST.VariableDeclaration.prototype.__kind = {};
AST.VariableDeclaration.prototype.kind = function(v){ return this._kind; }
AST.VariableDeclaration.prototype.setKind = function(v){ this._kind = v; return this; }
;

AST.VariableDeclaration.prototype.visit = function (){
	return this.map(function (item){
		return item.traverse();
	});
};
AST.VariableDeclaration.prototype.add = function (name,init){
	var vardec = new AST.VariableDeclarator(name,init);
	this.push(vardec);
	return vardec;
};
AST.VariableDeclaration.prototype.load = function (list){
	return list.map(function (par){
		return new AST.VariableDeclarator(par.name(),par.defaults(),par.splat());
	});
};
AST.VariableDeclaration.prototype.isExpressable = function (){
	return this.list().every(function (item){
		return item.isExpressable();
	});
};
AST.VariableDeclaration.prototype.js = function (){
	if(this.count() == 0) {
		return AST.EMPTY;
	};
	
	if(this.count() == 1 && !this.isExpressable()) {
		this.p("SHOULD ALTER VARDEC!!!".cyan());
		this.first().variable().autodeclare();
		var node = this.first().assignment();
		return node.c();
	};
	return "var " + this.map(function (arg){
		return arg.c();
	}).compact().join(", ") + "";
};
AST.VariableDeclarator = imba$class(function VariableDeclarator(){
	AST.Param.apply(this,arguments);
},AST.Param);
AST.VariableDeclarator.prototype.visit = function (){
	var variable_, v_;
	(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),null)), v_));
	if(this.defaults()) {
		this.defaults().traverse();
	};
	this.variable().setDeclarator(this);
	this.variable().addReference(this.name());
	return this;
};
AST.VariableDeclarator.prototype.js = function (){
	if(this.variable()._proxy) {
		return null;
	};
	return (this.defaults() != null && this.defaults() != undefined) ? (("" + (this.variable().c()) + "=" + (this.defaults().c({expression: true})))) : (("" + (this.variable().c())));
};
AST.VariableDeclarator.prototype.accessor = function (){
	return this;
};
AST.VarName = imba$class(function VarName(a,b){
	AST.VarName.prototype.__super.constructor.apply(this,arguments);
	this._splat = b;
},AST.ValueNode);

AST.VarName.prototype.__variable = {};
AST.VarName.prototype.variable = function(v){ return this._variable; }
AST.VarName.prototype.setVariable = function(v){ this._variable = v; return this; }
;

AST.VarName.prototype.__splat = {};
AST.VarName.prototype.splat = function(v){ return this._splat; }
AST.VarName.prototype.setSplat = function(v){ this._splat = v; return this; }
;

AST.VarName.prototype.visit = function (){
	var variable_, v_;
	this.p("visiting varname(!)",this.value().c());
	(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.value().c(),null)), v_));
	this.variable().setDeclarator(this);
	this.variable().addReference(this.value());
	return this;
};
AST.VarName.prototype.js = function (){
	return this.variable().c();
};
AST.VarList = imba$class(function VarList(t,l,r){
	this._type = this.type();
	this._left = l;
	this._right = r;
},AST.Node);

AST.VarList.prototype.__type = {};
AST.VarList.prototype.type = function(v){ return this._type; }
AST.VarList.prototype.setType = function(v){ this._type = v; return this; }
;

AST.VarList.prototype.__left = {};
AST.VarList.prototype.left = function(v){ return this._left; }
AST.VarList.prototype.setLeft = function(v){ this._left = v; return this; }
;

AST.VarList.prototype.__right = {};
AST.VarList.prototype.right = function(v){ return this._right; }
AST.VarList.prototype.setRight = function(v){ this._right = v; return this; }
;

AST.VarList.prototype.visit = function (){
	for(var i=0, ary=iter$(this.left()), len=ary.length; i < len; i++){
		ary[i].traverse();
		if((this.setR(this.right()[($1=i)]), this.right()[$1])) {
			this.r().traverse();
		};
	};
	return this;
};
AST.VarList.prototype.js = function (){
	var pairs = [];
	var ll = this.left().length;
	var rl = this.right().length;
	var v = null;
	if(ll > 1 && rl == 1) {
		this.p("multiassign!");
		var r = this.right()[0];
		r.cache();
		for(var i=0, ary=iter$(this.left()), len=ary.length, l; i < len; i++){
			l = ary[i];
			if(l.splat()) {
				throw "not supported?";
				this.p("splat");
				if(i == ll - 1) {
					v = this.util().slice(r,i);
					this.p("last");
				} else {
					v = this.util().slice(r,i,-(ll - i) + 1);
				};
			} else {
				v = OP('.',r,i.toAST());
			};
			pairs.push(OP('=',l,v));
		};
	} else {
		for(var i=0, ary=iter$(this.left()), len=ary.length, l; i < len; i++){
			l = ary[i];
			var r = this.right()[i];
			pairs.push((r) ? (OP('=',l.variable().accessor(),r)) : (l));
		};
	};
	return ("var " + (pairs.c()));
};
}())