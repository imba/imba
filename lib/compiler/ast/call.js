(function(){
AST.ArgList = imba$class(function ArgList(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ArgList.prototype.splat = function (){
	return this.list().some(function (v){
		return v instanceof AST.Splat;
	});
};
AST.ArgList.prototype.js = function (){
	return this.compact().map(function (arg){
		return arg.c({expression: true});
	}).join(",");
};
AST.ArgList.prototype.c = function (o){
	return AST.ArgList.prototype.__super.c.call(this,o);
};
AST.Call = imba$class(function Call(callee,args,opexists){
	if(callee instanceof AST.VarOrAccess) {
		var str = callee.value().symbol();
		if(str == 'extern') {
			return new AST.ExternDeclaration(args);
		};
		if(str == 'tag') {
			return new AST.TagWrapper(args[0]);
		};
	};
	this._callee = callee;
	this._args = new AST.ArgList(args || []);
	this;
},AST.Expression);

AST.Call.prototype.__callee = {};
AST.Call.prototype.callee = function(v){ return this._callee; }
AST.Call.prototype.setCallee = function(v){ this._callee = v; return this; }
;

AST.Call.prototype.__receiver = {};
AST.Call.prototype.receiver = function(v){ return this._receiver; }
AST.Call.prototype.setReceiver = function(v){ this._receiver = v; return this; }
;

AST.Call.prototype.__args = {};
AST.Call.prototype.args = function(v){ return this._args; }
AST.Call.prototype.setArgs = function(v){ this._args = v; return this; }
;

AST.Call.prototype.__block = {};
AST.Call.prototype.block = function(v){ return this._block; }
AST.Call.prototype.setBlock = function(v){ this._block = v; return this; }
;

AST.Call.prototype.visit = function (){
	this.args().traverse();
	this.callee().traverse();
	
	return this._block && this._block.traverse();
};
AST.Call.prototype.addBlock = function (block){
	var pos = this._args.filter(function (n,i){
		return n == '&';
	})[0];
	if(pos) {
		this.args().replace(pos,block);
	} else {
		this.args().push(block);
	};
	return this;
};
AST.Call.prototype.receiver = function (){
	return this._receiver || (this._receiver = ((this.callee() instanceof AST.Access) && this.callee().left() || AST.NULL));
};
AST.Call.prototype.safechain = function (){
	return this.callee().safechain();
};
AST.Call.prototype.c = function (){
	return AST.Call.prototype.__super.c.apply(this,arguments);
};
AST.Call.prototype.js = function (){
	var opt = {expression: true};
	var rec = null;
	var args = this.args().compact();
	var splat = args.some(function (v){
		return v instanceof AST.Splat;
	});
	var out = null;
	var lft = null;
	var rgt = null;
	var wrap = null;
	
	this._callee = this._callee.node();
	
	if((this.callee() instanceof AST.Call) && this.callee().safechain()) {
		true;
	};
	if(this.callee() instanceof AST.Access) {
		lft = this.callee().left();
		rgt = this.callee().right();
	};
	if((this.callee() instanceof AST.Super) || (this.callee() instanceof AST.SuperAccess)) {
		this._receiver = this.scope__().context();
	};
	if((this.callee() instanceof AST.PropertyAccess) && (rec = this.callee().receiver())) {
		this._callee = OP('.',this.callee().left(),this.callee().right());
		this._receiver = rec;
	};
	if(lft && lft.safechain()) {
		lft.cache();
	};
	if(this.callee().safechain()) {
		if(lft) {
			lft.cache();
		};
		var isfn = new AST.Util.IsFunction([this.callee()]);
		wrap = [("" + (isfn.c()) + " && "), ""];
	};
	if(splat) {
		var ary = ((args.count() == 1) ? (new AST.ValueNode(args.first().value())) : (new AST.Arr(args.list())));
		this.receiver().cache();
		out = ("" + (this.callee().c({expression: true})) + ".apply(" + (this.receiver().c()) + "," + (ary.c({expression: true})) + ")");
	} else {
		if(this._receiver) {
			this._receiver.cache();
			args.unshift(this.receiver());
			out = ("" + (this.callee().c({expression: true})) + ".call(" + (args.c({expression: true})) + ")");
		} else {
			out = ("" + (this.callee().c({expression: true})) + "(" + (args.c({expression: true})) + ")");
		}
	};
	if(wrap) {
		if(this._cache) {
			this._cache.manual = true;
			out = ("(" + (this.cachevar().c()) + "=" + out + ")");
		};
		out = [wrap[0], out, wrap[1]].join("");
	};
	return out;
};
AST.ImplicitCall = imba$class(function ImplicitCall(){
	AST.Call.apply(this,arguments);
},AST.Call);
AST.ImplicitCall.prototype.js = function (){
	return "" + (this.callee().c()) + "()";
};
AST.New = imba$class(function New(){
	AST.Call.apply(this,arguments);
},AST.Call);
AST.New.prototype.js = function (o){
	var out = ("new " + (this.callee().c()));
	if(!((o.parent() instanceof AST.Call))) {
		out += '()';
	};
	return out;
};
AST.SuperCall = imba$class(function SuperCall(){
	AST.Call.apply(this,arguments);
},AST.Call);
AST.SuperCall.prototype.js = function (o){
	var m = o.method();
	this.setReceiver(AST.SELF);
	this.setCallee(("" + (m.target().c()) + ".super$.prototype." + (m.name().c())));
	return AST.SuperCall.prototype.__super.js.apply(this,arguments);
};
AST.ExternDeclaration = imba$class(function ExternDeclaration(){
	AST.ListNode.apply(this,arguments);
},AST.ListNode);
AST.ExternDeclaration.prototype.visit = function (){
	this.setNodes(this.map(function (item){
		return item.node();
	}));
	var root = this.scope__();
	this.nodes().map(function (item){
		var variable = root.register(item.symbol(),item,{type: 'global'});
		return variable.addReference(item);
	});
	return this;
};
AST.ExternDeclaration.prototype.c = function (){
	return "// externs";
};
}())