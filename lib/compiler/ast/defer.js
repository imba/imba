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
	
	/* @class Await */
	AST.Await = function Await(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.Await,AST.ValueNode);
	
	AST.Await.prototype.__func = {};
	AST.Await.prototype.func = function(v){ return this._func; }
	AST.Await.prototype.setFunc = function(v){ this._func = v; return this; };
	
	AST.Await.prototype.js = function (){
		// introduce a util here, no?
		return CALL(OP('.',new AST.Util.Promisify([this.value()]),'then').prebreak(),[this.func()]).c();
		// value.c
	};
	
	AST.Await.prototype.visit = function (o){
		// things are now traversed in a somewhat chaotic order. Need to tighten
		// Create await function - push this value up to block, take the outer
		var self=this;
		self.value().traverse();
		
		var block = o.up(AST.Block);// or up to the closest FUNCTION?
		var outer = o.relative(block,1);
		var par = o.relative(self,-1);
		
		// p "Block {block} {outer} {par}"
		
		self.setFunc(new AST.AsyncFunc([],[]));
		// now we move this node up to the block
		self.func().body().setNodes(block.defers(outer,self));
		
		// if the outer is a var-assignment, we can simply set the params
		if(par instanceof AST.Assign) {
			par.left().traverse();
			var lft = par.left().node();
			// p "Async assignment {par} {lft}"
			// Can be a tuple as well, no?
			if(lft instanceof AST.VarReference) {
				// the param is already registered?
				// should not force the name already??
				// beware of bugs
				self.func().params().at(0,true,lft.variable().name());
			} else if(lft instanceof AST.Tuple) {
				// if this an unfancy tuple, with only vars
				// we can just use arguments
				
				if(par.type() == 'var' && !(lft.hasSplat())) {
					// p "SIMPLIFY! {lft.nodes[0]}"
					lft.map(function (el,i){
						return self.func().params().at(i,true,el.value());
					});
				} else {
					// otherwise, do the whole tuple
					// make sure it is a var assignment?
					par.setRight(AST.ARGUMENTS);
					self.func().body().unshift(par);
				};
			} else {
				// regular setters
				par.setRight(self.func().params().at(0,true));
				self.func().body().unshift(par);
			};
		};
		
		
		
		// If it is an advance tuple or something, it should be possible to
		// feed in the paramlist, and let the tuple handle it as if it was any
		// other value
		
		// CASE If this is a tuple / multiset with more than one async value
		// we need to think differently.
		
		// now we need to visit the function as well
		self.func().traverse();
		// pull the outer in
		return self;
	};
	
	
	/* @class AsyncFunc */
	AST.AsyncFunc = function AsyncFunc(params,body,name,target,options){
		AST.AsyncFunc.__super__.constructor.apply(this,arguments);
	};
	
	subclass$(AST.AsyncFunc,AST.Func);
	
	
	AST.AsyncFunc.prototype.scopetype = function (){
		return AST.LambdaScope;
	};
	
	// need to override, since we wont do implicit returns
	// def js
	// 	var code = scope.c
	// 	return "function ({params.c})" + code.wrap
	;


}())