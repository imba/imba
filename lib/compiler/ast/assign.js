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
	
	/* @class Assign */
	AST.Assign = function Assign(){ AST.Op.apply(this,arguments) };
	
	subclass$(AST.Assign,AST.Op);
	AST.Assign.prototype.isExpressable = function (){
		return !this.right() || this.right().isExpressable();
	};
	
	AST.Assign.prototype.isUsed = function (){
		if((this.up() instanceof AST.Block) && this.up().last() != this) {// hmm
			return false;
		};
		return true;
	};
	
	AST.Assign.prototype.js = function (o){
		
		if(!(this.right().isExpressable())) {
			return this.right().consume(this).c();
		};
		
		// p "assign left {left:contrstru}"
		var l = this.left().node();
		
		// We are setting self(!)
		// TODO document functionality
		if(l instanceof AST.Self) {
			var ctx = this.scope__().context();
			l = ctx.reference();
		};
		
		
		if(l instanceof AST.PropertyAccess) {
			var ast = CALL(OP('.',l.left(),l.right().setter()),[this.right()]);
			ast.setReceiver(l.receiver());
			
			if(this.isUsed()) {
				// dont cache it again if it is already cached(!)
				if(!(this.right().cachevar())) {
					this.right().cache({type: 'val',uses: 1});
				};// 
				ast = new AST.Parens([ast,this.right()].block());
			};
			
			// should check the up-value no?
			return ast.c({expression: true});
		};
		
		// FIXME -- does not always need to be an expression?
		var out = ("" + (l.c()) + " " + this.op() + " " + (this.right().c({expression: true})));
		
		return out;
	};
	
	AST.Assign.prototype.shouldParenthesize = function (){
		return (this.up() instanceof AST.Op) && this.up().op() != '=';
	};
	
	
	AST.Assign.prototype.consume = function (node){
		if(this.isExpressable()) {
			this.forceExpression();
			return AST.Assign.__super__.consume.apply(this,arguments);
		};
		
		var ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	
	
	/* @class PushAssign */
	AST.PushAssign = function PushAssign(){ AST.Assign.apply(this,arguments) };
	
	subclass$(AST.PushAssign,AST.Assign);
	AST.PushAssign.prototype.js = function (){
		return "" + (this.left().c()) + ".push(" + (this.right().c()) + ")";
	};
	
	AST.PushAssign.prototype.consume = function (node){
		return this;
	};
	
	
	
	/* @class ConditionalAssign */
	AST.ConditionalAssign = function ConditionalAssign(){ AST.Assign.apply(this,arguments) };
	
	subclass$(AST.ConditionalAssign,AST.Assign);
	AST.ConditionalAssign.prototype.consume = function (node){
		return this.normalize().consume(node);
	};
	
	AST.ConditionalAssign.prototype.normalize = function (){
		var l = this.left().node();
		var ls = l;
		
		if(l instanceof AST.Access) {
			// p "conditional-assign {l} {l.left} {l.right}"
			if(l.left()) {// hmm
				// p "cache l.left {l.left:constructor}̋"
				l.left().cache();
			};
			ls = l.clone(l.left(),l.right());// this should still be cached?
			if(l instanceof AST.PropertyAccess) {
				l.cache();
			};// correct now, to a certain degree
			if(l instanceof AST.IndexAccess) {
				// p "cache the right side of indexAccess!!! {l.right}"
				l.right().cache();
			};
			
			// we should only cache the value itself if it is dynamic?
			// l.cache # cache the value as well -- we cannot use this in assigns them
		};
		
		// some ops are less messy
		// need op to support consume then?
		var expr = this.right().isExpressable();
		var ast = null;
		// here we should use ast = if ...
		if(expr && this.op() == '||=') {
			ast = OP('||',l,OP('=',ls,this.right()));
		} else if(expr && this.op() == '&&=') {
			ast = OP('&&',l,OP('=',ls,this.right()));
		} else {
			ast = IF(this.condition(),OP('=',ls,this.right()),l);
		};
		if(ast.isExpressable()) {
			ast.toExpression();
		};// hmm
		return ast;
	};
	
	
	AST.ConditionalAssign.prototype.c = function (){
		// WARN what if we return the same?
		return this.normalize().c();
	};
	
	AST.ConditionalAssign.prototype.condition = function (){
		// use switch instead to cache op access
		return (this.op() == '?=') ? (
			OP('==',this.left(),AST.NULL)
		) : ((this.op() == '||=') ? (
			OP('!',this.left())
		) : ((this.op() == '&&=') ? (
			this.left()
		) : ((this.op() == '!?=') ? (
			OP('!=',this.left(),AST.NULL)
		) : (
			this.left()
		))));
	};
	
	AST.ConditionalAssign.prototype.js = function (){
		// p "ConditionalAssign.js".red
		var ast = IF(this.condition(),OP('=',this.left(),this.right()),this.left());
		if(ast.isExpressable()) {
			ast.toExpression();
		};
		return ast.c();
	};
	
	
	/* @class CompoundAssign */
	AST.CompoundAssign = function CompoundAssign(){ AST.Assign.apply(this,arguments) };
	
	subclass$(AST.CompoundAssign,AST.Assign);
	AST.CompoundAssign.prototype.consume = function (node){
		if(this.isExpressable()) {
			return AST.CompoundAssign.__super__.consume.apply(this,arguments);
		};
		
		var ast = this.normalize();
		if(!(ast == this)) {
			return ast.consume(node);
		};
		
		ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	AST.CompoundAssign.prototype.normalize = function (){
		var ln = this.left().node();
		// we dont need to change this at all
		if(!((ln instanceof AST.PropertyAccess))) {
			return this;
		};
		
		if(ln instanceof AST.Access) {
			// left might be zero?!?!
			if(ln.left()) {
				ln.left().cache();
			};
		};
		// TODO FIXME we want to cache the context of the assignment
		// p "normalize compound assign {left}"
		var ast = OP('=',this.left(),OP(this.op()[0],this.left(),this.right()));
		if(ast.isExpressable()) {
			ast.toExpression();
		};
		
		return ast;
	};
	
	AST.CompoundAssign.prototype.c = function (){
		var ast = this.normalize();
		if(ast == this) {
			return AST.CompoundAssign.__super__.c.apply(this,arguments);
		};
		
		// otherwise it is important that we actually replace this node in the outer block
		// whenever we normalize and override c it is important that we can pass on caching
		// etc -- otherwise there WILL be issues.
		var up = STACK.current();
		if(up instanceof AST.Block) {
			// p "parent is block, should replace!"
			// an alternative would be to just pass
			up.replace(this,ast);
		};
		return ast.c();
	};
	
	
	
	/* @class AsyncAssign */
	AST.AsyncAssign = function AsyncAssign(){ AST.Assign.apply(this,arguments) };
	
	subclass$(AST.AsyncAssign,AST.Assign);
	
	
	
	/* @class TupleAssign */
	AST.TupleAssign = function TupleAssign(a,b,c){
		this._op = a;
		this._left = b;
		this._right = c;
		this._temporary = [];
	};
	
	subclass$(AST.TupleAssign,AST.Assign);
	
	AST.TupleAssign.prototype.__op = {};
	AST.TupleAssign.prototype.op = function(v){ return this._op; }
	AST.TupleAssign.prototype.setOp = function(v){ this._op = v; return this; };
	
	AST.TupleAssign.prototype.__left = {};
	AST.TupleAssign.prototype.left = function(v){ return this._left; }
	AST.TupleAssign.prototype.setLeft = function(v){ this._left = v; return this; };
	
	AST.TupleAssign.prototype.__right = {};
	AST.TupleAssign.prototype.right = function(v){ return this._right; }
	AST.TupleAssign.prototype.setRight = function(v){ this._right = v; return this; };
	
	AST.TupleAssign.prototype.__type = {};
	AST.TupleAssign.prototype.type = function(v){ return this._type; }
	AST.TupleAssign.prototype.setType = function(v){ this._type = v; return this; };
	
	
	
	AST.TupleAssign.prototype.isExpressable = function (){
		return this.right().isExpressable();
	};
	
	AST.TupleAssign.prototype.addExpression = function (expr){
		var v_;
		if(this.right() instanceof AST.Tuple) {
			this.right().push(expr);
		} else {
			// p "making child become a tuple?"
			(this.setRight(v_=new AST.Tuple([this.right(),expr])),v_);
		};
		
		return this;
	};
	
	AST.TupleAssign.prototype.visit = function (){
		// if the first left-value is a var-reference, then
		// all the variables should be declared as variables.
		// but if we have complex items in the other list - it does become much harder
		
		// if the first is a var-reference, they should all be(!) .. or splats?
		// this is really a hacky wao to do it though
		var v_;
		if(this.left().first().node() instanceof AST.VarReference) {
			(this.setType(v_='var'),v_);
			// NOTE can improve.. should rather make the whole left be a VarBlock or TupleVarBlock
			// p "type is var -- skip the rest"
		};
		
		this.right().traverse();
		this.left().traverse();
		return this;
	};
	
	AST.TupleAssign.prototype.js = function (){
		// only for actual inner expressions, otherwise cache the whole array, no?
		var self=this;
		if(!(self.right().isExpressable())) {
			// p "TupleAssign.consume! {right}".blue
			return self.right().consume(self).c();
		};
		
		//  a,b,c = arguments 
		
		// - direct. no matter if lvalues are variables or not. Make fake arguments up to the same count as tuple
		
		//  a,*b,b = arguments 
		
		// Need to convert arguments to an array. IF arguments is not referenced anywhere else in scope, 
		// we can do the assignment directly while rolling through arguments
		
		//  a,b = b,a 
		
		// ideally we only need to cache the first value (or n - 1), assign directly when possible.
		
		//  a,b,c = (method | expression) 
		
		// convert res into array, assign from array. Can cache the variable when assigning first value
		
		// First we need to find out whether we are required to store the result in an array before assigning
		// If this needs to be an expression (returns?, we need to fall back to the CS-wa)
		
		var ast = new AST.Block();
		var lft = self.left();
		var rgt = self.right();
		var typ = self.type();
		var via = null;
		
		var li = 0;
		var ri = lft.count();
		var llen = ri;
		
		
		
		// if we have a splat on the left it is much more likely that we need to store right
		// in a temporary array, but if the right side has a known length, it should still not be needed
		var lsplat = lft.filter(function (v){
			return v instanceof AST.Splat;
		})[0];
		
		// if right is an array without any splats (or inner tuples?), normalize it to tuple
		if((rgt instanceof AST.Arr) && !(rgt.splat())) {
			rgt = new AST.Tuple(rgt.nodes());
		};
		var rlen = (rgt instanceof AST.Tuple) ? (rgt.count()) : (null);
		
		// if any values are statements we need to handle this before continuing
		
		//  a,b,c = 10,20,ary 
		
		// ideally we only need to cache the first value (or n - 1), assign directly when possible.
		// only if the variables are not predefined or predeclared can be we certain that we can do it without caching
		// if rlen && typ == 'var' && !lsplat
		// 	# this can be dangerous in edgecases that are very hard to detect
		// 	# if it becomes an issue, fall back to simpler versions
		// 	# does not even matter if there is a splat?
		
		// special case for arguments(!)
		if(!lsplat && rgt == AST.ARGUMENTS) {
			
			var pars = self.scope__().params();
			// p "special case with arguments {pars}"
			// forcing the arguments to be named
			// p "got here??? {pars}"
			lft.map(function (l,i){
				return ast.push(OP('=',l.node(),pars.at(i,true).visit().variable()));
			});// s.params.at(value - 1,yes)
		} else if(rlen) {
			// we have several items in the right part. what about splats here?
			
			// pre-evaluate rvalues that might be reference from other assignments
			// we need to check if the rightside values has no side-effects. Cause if
			// they dont, we really do not need temporary variables.
			
			// some of these optimizations are quite petty - makes things more complicated
			// in the compiler only to get around adding a few temp-variables here and there
			
			// var firstUnsafe = 0
			// lft.map do |v,i|
			// 	if v isa AST.VarReference
			// 		p "left side {i} {v} {v.refnr}"
			
			// rgt.map do |v,i|
			// 	if v.hasSideEffects
			// 		# return if i == 0 or !v.hasSideEffects
			// 		# return if v isa AST.Num || v isa AST.Str || i == 0
			// 		# we could explicitly create a temporary variable and adding nodes for accessing etc
			// 		# but the builtin caching should really take care of this for us
			// 		# we need to really force the caching though -- since we need a copy of it even if it is a local
			// 		# we need to predeclare the variables at the top of scope if this does not take care of it
			// 		
			// 		# these are the declarations -- we need to add them somewhere smart
			// 		@temporary.push(v) # need a generalized way to do this type of thing
			// 		ast.push(v.cache(force: yes, type: 'swap', declared: typ == 'var'))
			// 		# they do need to be declared, no?
			
			// now we can free the cached variables
			// ast.map do |n| n.decache
			
			var pre = [];
			var rest = [];
			
			var pairs = lft.map(function (l,i){
				var v = null;
				// determine if this needs to be precached?
				// if l isa AST.VarReference
				// 	# this is the first time the variable is referenced
				// 	# should also count even if it is predeclared at the top
				// 	if l.refnr == 0
				
				if(l == lsplat) {
					v = [];
					var to = (rlen - (ri - i));
					// p "assing splat at index {i} to slice {li} - {to}".cyan
					while(li <= to){
						v.push(rgt.index(li++));
					};
					v = new AST.Arr(v);
					// ast.push OP('=',l.node,AST.Arr.new(v))
				} else {
					v = rgt.index(li++);// OP('.',rgt.index(li++),idx.toAST)
				};
				return [l.node(),v];
				
				// if l isa AST.VarReference && l.refnr 
			});
			var clean = true;
			
			pairs.map(function (v,i){
				var l = v[0];
				var r = v[1];
				
				if(clean) {
					if((l instanceof AST.VarReference) && l.refnr() == 0) {
						// still clean
						clean = true;
					} else {
						clean = false;
						// p "now cache"
						pairs.slice(i).map(function (part){
							return (part[1].hasSideEffects()) && (
								self._temporary.push(part[1]),// need a generalized way to do this type of thing
								ast.push(part[1].cache({force: true,type: 'swap',declared: typ == 'var'}))
							);
						});
						// p "from {i} - cache all remaining with side-effects"
					};
				};
				
				// if the previous value in ast is a reference to our value - the caching was not needed
				return (ast.last() == r) ? (
					r.decache(),
					// p "was cached - not needed"
					ast.replace(r,OP('=',l,r))
				) : (
					ast.push(OP('=',l,r))
				);
			});
			
			// WARN FIXME Is there not an issue with VarBlock vs not here?
		} else {
			// this is where we need to cache the right side before assigning
			// if the right side is a for loop, we COULD try to be extra clever, but
			// for now it is not worth the added compiler complexity
			
			// iter.cache(force: yes, type: 'iter')
			var top = new AST.VarBlock();
			var iter = self.util().iterable(rgt,true);
			// could set the vars inside -- most likely
			ast.push(top);
			top.push(iter);
			
			if(lsplat) {
				var len = self.util().len(iter,true);
				var idx = self.util().counter(0,true);
				// cache the length of the array
				top.push(len);// preassign the length
				// cache counter to loop through
				top.push(idx);
			};
			
			// only if the block is variable based, no?
			// ast.push(blk = AST.VarBlock.new)
			// blk = nil
			
			var blktype = (typ == 'var') ? (AST.VarBlock) : (AST.Block);
			var blk = new blktype();
			// blk = top if typ == 'var'
			ast.push(blk);
			
			// if the lvals are not variables - we need to preassign
			// can also use slice here for simplicity, but try with while now			
			lft.map(function (l,i){
				var lvar, rem, arr, test, set;
				return (l == lsplat) ? (
					lvar = l.node(),
					rem = llen - i - 1,// remaining after splat
					
					(typ != 'var') ? (
						arr = self.util().array(OP('-',len,(i + rem).toAST()),true),
						top.push(arr),
						lvar = arr.cachevar()
					) : (
						(!blk) && (ast.push(blk = new blktype())),
						arr = self.util().array(OP('-',len,(i + rem).toAST())),
						blk.push(OP('=',lvar,arr))
					),
					
					// if !lvar:variable || !lvar.variable # lvar = 
					// 	top.push()
					// p "has variable - no need to create a temp"
					// blk.push(OP('=',lvar,AST.Arr.new([]))) # dont precalculate size now
					// max = to = (rlen - (llen - i))
					
					
					test = (rem) ? (OP('-',len,rem)) : (len),
					// get = OP('.',lvar,OP('-',idx,i.toAST))
					set = OP('=',OP('.',lvar,OP('-',idx,i.toAST())),
					OP('.',iter,OP('++',idx))),
					
					ast.push(WHILE(OP('<',idx,test),set)),
					
					(typ != 'var') ? (
						ast.push(blk = new AST.Block()),
						blk.push(OP('=',l.node(),lvar))
					) : (
						blk = null
					)
					
					// not if splat was last?
					// ast.push(blk = AST.VarBlock.new)
				) : ((lsplat) ? (
					(!blk) && (ast.push(blk = new blktype())),
					// we could cache the raw code of this node for better performance
					blk.push(OP('=',l,OP('.',iter,OP('++',idx))))
				) : (
					(!blk) && (ast.push(blk = new blktype())),
					blk.push(OP('=',l,OP('.',iter,i.toAST())))
				));
			});
		};
		
		
		if(ast.isExpressable()) {// NO!
			var out = ast.c({expression: true});
			if(typ) {
				out = ("" + typ + " " + out);
			};
			return out;
		} else {
			return ast.c();
		};
	};
	


}())