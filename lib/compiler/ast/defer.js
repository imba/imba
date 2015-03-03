(function(){
AST.Await = imba$class(function Await(){
	AST.ValueNode.apply(this,arguments);
},AST.ValueNode);

AST.Await.prototype.__func = {};
AST.Await.prototype.func = function(v){ return this._func; }
AST.Await.prototype.setFunc = function(v){ this._func = v; return this; }
;

AST.Await.prototype.js = function (){
	return CALL(OP('.',new AST.Util.Promisify([this.value()]),'then'),[this.func()]).c();
};
AST.Await.prototype.visit = function (o){
	var self=this;
	self.value().traverse();
	
	var block = o.up(AST.Block);
	var outer = o.relative(block,1);
	var par = o.relative(self,-1);
	
	self.setFunc(new AST.AsyncFunc([],[]));
	self.func().body().setNodes(block.defers(outer,self));
	if(par instanceof AST.Assign) {
		par.left().traverse();
		var lft = par.left().node();
		if(lft instanceof AST.VarReference) {
			self.func().params().at(0,true,lft.variable().name());
		} else {
			if(lft instanceof AST.Tuple) {
				if(par.type() == 'var' && !(lft.hasSplat())) {
					lft.map(function (el,i){
						return self.func().params().at(i,true,el.value());
					});
				} else {
					par.setRight(AST.ARGUMENTS);
					self.func().body().unshift(par);
				};
			} else {
				par.setRight(self.func().params().at(0,true));
				self.func().body().unshift(par);
			}
		};
	};
	self.func().traverse();
	return self;
};
AST.AsyncFunc = imba$class(function AsyncFunc(params,body,name,target,options){
	AST.AsyncFunc.prototype.__super.constructor.apply(this,arguments);
},AST.Func);
AST.AsyncFunc.prototype.scopetype = function (){
	return AST.LambdaScope;
};
}())