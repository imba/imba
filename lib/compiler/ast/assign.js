(function(){
AST.Assign = imba$class(function Assign(){
	AST.Op.apply(this,arguments);
},AST.Op);
AST.Assign.prototype.c = function (){
	return AST.Assign.prototype.__super.c.apply(this,arguments);
};
AST.Assign.prototype.isExpressable = function (){
	return !this.right() || this.right().isExpressable();
};
AST.Assign.prototype.isUsed = function (){
	if((this.up() instanceof AST.Block) && this.up().last() != this) {
		return false;
	};
	return true;
};
AST.Assign.prototype.js = function (o){
	if(!(this.right().isExpressable())) {
		return this.right().consume(this).c();
	};
	var l = this.left().node();
	if(l instanceof AST.Self) {
		var ctx = this.scope__().context();
		l = ctx.reference();
	};
	if(l instanceof AST.PropertyAccess) {
		var ast = CALL(OP('.',l.left(),l.right().setter()),[this.right()]);
		ast.setReceiver(l.receiver());
		
		if(this.isUsed()) {
			if(!(this.right().cachevar())) {
				this.right().cache({type: 'val',uses: 1});
			};
			ast = new AST.Parens([ast, this.right()].block());
		};
		return ast.c({expression: true});
	};
	var out = ("" + (l.c()) + " " + this.op() + " " + (this.right().c({expression: true})));
	return out;
};
AST.Assign.prototype.shouldParenthesize = function (){
	return (this.up() instanceof AST.Op) && this.up().op() != '=';
};
AST.Assign.prototype.consume = function (node){
	if(this.isExpressable()) {
		this.forceExpression();
		return AST.Assign.prototype.__super.consume.apply(this,arguments);
	};
	var ast = this.right().consume(this);
	return ast.consume(node);
};
AST.PushAssign = imba$class(function PushAssign(){
	AST.Assign.apply(this,arguments);
},AST.Assign);
AST.PushAssign.prototype.js = function (){
	return "" + (this.left().c()) + ".push(" + (this.right().c()) + ")";
};
AST.PushAssign.prototype.consume = function (node){
	return this;
};
AST.ConditionalAssign = imba$class(function ConditionalAssign(){
	AST.Assign.apply(this,arguments);
},AST.Assign);
AST.ConditionalAssign.prototype.consume = function (node){
	return this.normalize().consume(node);
};
AST.ConditionalAssign.prototype.normalize = function (){
	var l = this.left().node();
	var ls = l;
	
	if(l instanceof AST.Access) {
		if(l.left()) {
			l.left().cache();
		};
		ls = l.clone(l.left(),l.right());
		if(l instanceof AST.PropertyAccess) {
			l.cache();
		};
		if(l instanceof AST.IndexAccess) {
			l.right().cache();
		};
	};
	var expr = this.right().isExpressable();
	var ast = null;
	if(expr && this.op() == '||=') {
		ast = OP('||',l,OP('=',ls,this.right()));
	} else {
		if(expr && this.op() == '&&=') {
			ast = OP('&&',l,OP('=',ls,this.right()));
		} else {
			ast = IF(this.condition(),OP('=',ls,this.right()),l);
		}
	};
	if(ast.isExpressable()) {
		ast.toExpression();
	};
	return ast;
};
AST.ConditionalAssign.prototype.c = function (){
	var ast = this.normalize();
	return ast.c();
};
AST.ConditionalAssign.prototype.condition = function (){
	return (this.op() == '?=') ? (OP('==',this.left(),AST.NULL)) : ((this.op() == '||=') ? (OP('!',this.left())) : ((this.op() == '&&=') ? (this.left()) : ((this.op() == '!?=') ? (OP('!=',this.left(),AST.NULL)) : (this.left()))));
};
AST.ConditionalAssign.prototype.js = function (){
	var ast = IF(this.condition(),OP('=',this.left(),this.right()),this.left());
	if(ast.isExpressable()) {
		ast.toExpression();
	};
	return ast.c();
};
AST.CompoundAssign = imba$class(function CompoundAssign(){
	AST.Assign.apply(this,arguments);
},AST.Assign);
AST.CompoundAssign.prototype.consume = function (node){
	if(this.isExpressable()) {
		return AST.CompoundAssign.prototype.__super.consume.apply(this,arguments);
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
	if(!((ln instanceof AST.PropertyAccess))) {
		return this;
	};
	if(ln instanceof AST.Access) {
		if(ln.left()) {
			ln.left().cache();
		};
	};
	var ast = OP('=',this.left(),OP(this.op()[0],this.left(),this.right()));
	if(ast.isExpressable()) {
		ast.toExpression();
	};
	
	return ast;
};
AST.CompoundAssign.prototype.c = function (){
	var ast = this.normalize();
	if(ast == this) {
		return AST.CompoundAssign.prototype.__super.c.apply(this,arguments);
	};
	var up = STACK.current();
	if(up instanceof AST.Block) {
		up.replace(this,ast);
	};
	return ast.c();
};
AST.AsyncAssign = imba$class(function AsyncAssign(){
	AST.Assign.apply(this,arguments);
},AST.Assign);


AST.TupleAssign = imba$class(function TupleAssign(a,b,c){
	this._op = a;
	this._left = b;
	this._right = c;
	this._temporary = [];
},AST.Assign);

AST.TupleAssign.prototype.__op = {};
AST.TupleAssign.prototype.op = function(v){ return this._op; }
AST.TupleAssign.prototype.setOp = function(v){ this._op = v; return this; }
;

AST.TupleAssign.prototype.__left = {};
AST.TupleAssign.prototype.left = function(v){ return this._left; }
AST.TupleAssign.prototype.setLeft = function(v){ this._left = v; return this; }
;

AST.TupleAssign.prototype.__right = {};
AST.TupleAssign.prototype.right = function(v){ return this._right; }
AST.TupleAssign.prototype.setRight = function(v){ this._right = v; return this; }
;

AST.TupleAssign.prototype.__type = {};
AST.TupleAssign.prototype.type = function(v){ return this._type; }
AST.TupleAssign.prototype.setType = function(v){ this._type = v; return this; }
;

AST.TupleAssign.prototype.isExpressable = function (){
	return this.right().isExpressable();
};
AST.TupleAssign.prototype.addExpression = function (expr){
	var v_;
	if(this.right() instanceof AST.Tuple) {
		this.right().push(expr);
	} else {
		(this.setRight(v_=new AST.Tuple([this.right(), expr])), v_);
	};
	return this;
};
AST.TupleAssign.prototype.visit = function (){
	var v_;
	if(this.left().first().node() instanceof AST.VarReference) {
		(this.setType(v_='var'), v_);
	};
	this.right().traverse();
	this.left().traverse();
	return this;
};
AST.TupleAssign.prototype.js = function (){
	var self=this;
	if(!(self.right().isExpressable())) {
		return self.right().consume(self).c();
	};
	/*  a,b,c = arguments  */;
	/*  a,*b,b = arguments  */;
	/*  a,b = b,a  */;
	/*  a,b,c = (method | expression)  */;
	var ast = new AST.Block();
	var lft = self.left();
	var rgt = self.right();
	var typ = self.type();
	var via = null;
	
	var li = 0;
	var ri = lft.count();
	var llen = ri;
	var lsplat = lft.filter(function (v){
		return v instanceof AST.Splat;
	})[0];
	if((rgt instanceof AST.Arr) && !(rgt.splat())) {
		rgt = new AST.Tuple(rgt.nodes());
	};
	var rlen = (rgt instanceof AST.Tuple) ? (rgt.count()) : (null);
	/*  a,b,c = 10,20,ary  */;
	if(!lsplat && rgt == AST.ARGUMENTS) {
		var pars = self.scope__().params();
		lft.map(function (l,i){
			return ast.push(OP('=',l.node(),pars.at(i,true).visit().variable()));
		});
	} else {
		if(rlen) {
			var pre = [];
			var rest = [];
			
			var pairs = lft.map(function (l,i){
				var v = null;
				
				if(l == lsplat) {
					v = [];
					var to = (rlen - (ri - i));
					while(li <= to){
						v.push(rgt.index(li++));
					};
					v = new AST.Arr(v);
				} else {
					v = rgt.index(li++);
				};
				return [l.node(), v];
			});
			var clean = true;
			
			pairs.map(function (v,i){
				var l = v[0];
				var r = v[1];
				
				if(clean) {
					if((l instanceof AST.VarReference) && l.refnr() == 0) {
						clean = true;
					} else {
						clean = false;
						pairs.slice(i).map(function (part){
							return (part[1].hasSideEffects()) && (self._temporary.push(part[1]), ast.push(part[1].cache({force: true,type: 'swap',declared: typ == 'var'})));
						});
					};
				};
				return (ast.last() == r) ? (r.decache(), ast.replace(r,OP('=',l,r))) : (ast.push(OP('=',l,r)));
			});
		} else {
			var top = new AST.VarBlock();
			var iter = self.util().iterable(rgt,true);
			ast.push(top);
			top.push(iter);
			
			if(lsplat) {
				var len = self.util().len(iter,true);
				var idx = self.util().counter(0,true);
				top.push(len);
				top.push(idx);
			};
			var blktype = (typ == 'var') ? (AST.VarBlock) : (AST.Block);
			var blk = new blktype();
			ast.push(blk);
			lft.map(function (l,i){
				var lvar, rem, arr, test, set;
				return (l == lsplat) ? (lvar = l.node(), rem = llen - i - 1, (typ != 'var') ? (arr = self.util().array(OP('-',len,(i + rem).toAST()),true), top.push(arr), lvar = arr.cachevar()) : ((!blk) && (ast.push(blk = new blktype())), arr = self.util().array(OP('-',len,(i + rem).toAST())), blk.push(OP('=',lvar,arr))), test = (rem) ? (OP('-',len,rem)) : (len), set = OP('=',OP('.',lvar,OP('-',idx,i.toAST())),OP('.',iter,OP('++',idx))), ast.push(WHILE(OP('<',idx,test),set)), (typ != 'var') ? (ast.push(blk = new AST.Block()), blk.push(OP('=',l.node(),lvar))) : (blk = null)) : ((lsplat) ? ((!blk) && (ast.push(blk = new blktype())), blk.push(OP('=',l,OP('.',iter,OP('++',idx))))) : ((!blk) && (ast.push(blk = new blktype())), blk.push(OP('=',l,OP('.',iter,i.toAST())))));
			});
		}
	};
	if(ast.isExpressable()) {
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