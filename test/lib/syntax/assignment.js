(function(){


	union$ = function(a,b){
		if(a && a.__union) return a.__union(b);
	
		var u = a.slice(0);
		for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);
		return u;
	};
	
	intersect$ = function(a,b){
		if(a && a.__intersect) return a.__intersect(b);
		var res = [];
		for(var i=0, l=a.length; i<l; i++) {
			var v = a[i];
			if(b.indexOf(v) != -1) res.push(v);
		}
		return res;
	};
	
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// self = SPEC
	
	/* @class O */
	function O(){ };
	
	
	O.prototype.__x = {};
	O.prototype.x = function(v){ return this._x; }
	O.prototype.setX = function(v){ this._x = v; return this; };
	
	O.prototype.__y = {};
	O.prototype.y = function(v){ return this._y; }
	O.prototype.setY = function(v){ this._y = v; return this; };
	
	O.prototype.__z = {};
	O.prototype.z = function(v){ return this._z; }
	O.prototype.setZ = function(v){ this._z = v; return this; };
	
	
	/* @class SyntaxAssignment */
	function SyntaxAssignment(nestings){
		if(nestings === undefined) nestings = 0;
		this._gets = 0;
		this._sets = 0;
		this._calls = 0;
		if(nestings > 0) {
			this._child = new SyntaxAssignment(nestings - 1);
		};
		this;
	};
	
	
	
	SyntaxAssignment.prototype.setIvar = function (val){
		this._sets = this._sets + 1;
		return this._ivar = val;
	};
	
	SyntaxAssignment.prototype.ivar = function (){
		this._gets = this._gets + 1;
		return this._ivar;
	};
	
	SyntaxAssignment.prototype.child = function (){
		this._calls = this._calls + 1;
		return this._child;
	};
	
	SyntaxAssignment.prototype.gets = function (){
		return this._gets;
	};
	
	SyntaxAssignment.prototype.sets = function (){
		return this._sets;
	};
	
	SyntaxAssignment.prototype.calls = function (){
		return this._calls;
	};
	
	SyntaxAssignment.prototype.reset = function (){
		this._gets = 0;
		this._sets = 0;
		this._calls = 0;
		if(this._child) {
			this._child.reset();
		};
		return this;
	};
	
	SyntaxAssignment.prototype.testmeth1 = function (){
		this.reset();
		this._ivar = 10;
		var ivar = this.ivar();
		ivar;
		return this;
	};
	
	
	
	// Assignment
	// ----------
	
	// * Assignment
	// * Compound Assignment
	// * Destructuring Assignment
	// * Context Property (@) Assignment
	// * Existential Assignment (?=)
	describe('Syntax - Assignment',function (){
		
		describe("properties",function (){
			var obj = new SyntaxAssignment();
			
			test("=",function (){
				obj.setIvar(1);
				return eq(obj.ivar(),1);
			});
			
			test("||=",function (){
				var ivar_, v_, $1, $2;
				(ivar_=obj.ivar()) || ((obj.setIvar(v_=2),v_));
				eq(obj.ivar(),1);
				
				obj.setIvar(0);
				($1=obj.ivar()) || ((obj.setIvar(v_=2),v_));
				eq(obj.ivar(),2);
				
				obj.setIvar(null);
				($2=obj.ivar()) || ((obj.setIvar(v_=3),v_));
				return eq(obj.ivar(),3);
			});
			
			test("&&=",function (){
				var ivar_, v_;
				obj.setIvar(1);
				(ivar_=obj.ivar()) && ((obj.setIvar(v_=2),v_));
				return eq(obj.ivar(),2);
			});
			
			test("+=",function (){
				obj.setIvar(1);
				obj.setIvar(obj.ivar() + 1);
				return eq(obj.ivar(),2);
			});
			
			test("-=",function (){
				obj.setIvar(1);
				obj.setIvar(obj.ivar() - 1);
				return eq(obj.ivar(),0);
			});
			
			return test("caching target",function (){
				var child_;
				var o1 = new SyntaxAssignment(3);
				var o2 = o1.child();
				var o3 = o2.child();
				o1.reset();
				eq(o1.calls(),0);
				o1.child().child().setIvar(2);
				eq(o3.ivar(),2);
				eq(o1.calls(),1);
				
				(child_=o1.child().child()).setIvar(child_.ivar() + 2);
				eq(o3.ivar(),4);
				return eq(o1.calls(),2);
			});
			
			// test "var is not defined during set" do
		});
		
		
		describe("statements",function (){
			var obj = new SyntaxAssignment();
			var truthy = 1;
			var falsy = 0;
			
			test("=",function (){
				var v_;
				var localvar;
				obj.setIvar(1);
				eq(obj.ivar(),1);
				
				if(truthy) {
					try {
						localvar = (obj.setIvar(v_=4),v_);
					}
					catch (e) {
						localvar = (obj.setIvar($1=3),$1);
					}
					;
				} else {
					localvar = (obj.setIvar(v_=2),v_);
				};
				
				eq(localvar,4);
				eq(obj.ivar(),4);
				
				if(truthy) {
					try {
						localvar = (obj.setIvar(v_=nomethod()),v_);
					}
					catch (e) {
						localvar = (obj.setIvar($1=3),$1);
					}
					;
				} else {
					localvar = (obj.setIvar(v_=2),v_);
				};
				
				eq(localvar,3);
				return eq(obj.ivar(),3);
			});
			
			test("||= statement",function (){
				var ivar_, v_;
				obj.setIvar(0);
				if(!(ivar_=(obj.ivar()))) {
					if(truthy) {
						try {
							var l = (obj.setIvar(v_=nomethod()),v_);
						}
						catch (e) {
							l = (obj.setIvar($1=3),$1);
						}
						;
					} else {
						l = (obj.setIvar(v_=2),v_);
					}
				} else {
					l = ivar_
				};
				
				eq(l,3);
				return eq(obj.ivar(),3);
			});
			
			test("+= statement",function (){
				var tmp, v_;
				var l0 = 0;
				var l1 = 0;
				var l2 = 0;
				var l3 = 1;
				obj.setIvar(1);
				
				// 
				if(!l1) {
					if(l3) {
						if(truthy) {
							try {
								l0 = l1 = (obj.setIvar(v_=obj.ivar() + (l3 = nomethod())),v_);
							}
							catch (e) {
								l0 = l1 = (obj.setIvar($1=obj.ivar() + (l3 = 3)),$1);
							}
							;
						} else {
							l0 = l1 = (obj.setIvar(v_=obj.ivar() + (l3 = 2)),v_);
						}
					} else {
						l0 = l1 = (obj.setIvar(v_=obj.ivar() + l3),v_)
					}
				} else {
					l0 = l1
				};
				
				eq(l0,l1);
				eq(l1,obj.ivar());
				return eq(obj.ivar(),4);
				// eq obj.ivar, 4
			});
			
			return test("caching access for compound assigns",function (){
				var child_, ivar_, v_;
				var o1 = new SyntaxAssignment(3);
				var o2 = o1.child();
				var o3 = o2.child();
				o1.reset();
				
				o1.setIvar(1);
				o1.child().setIvar(1);
				eq(o1.calls(),1);
				o1.reset();
				
				// on a compound access we should cache the left-side
				(ivar_=(child_=o1.child()).ivar()) && ((child_.setIvar(v_=2),v_));
				eq(o2.ivar(),2);
				return eq(o1.calls(),1);
			});
		});
		
		test("indexes",function (){
			var a = {};
			var b = false;
			a[(b) ? ('yes') : ('no')] = true;
			return eq(a.no,true);
		});
		
		// Compound Assignment
		test("boolean operators",function (){
			var nonce = {};
			
			var a = 0;
			a || (a = nonce);
			eq(nonce,a);
			
			var b = 1;
			b || (b = nonce);
			eq(1,b);
			
			// want to change this syntax later, or at least
			// introduce another one for value != null ...
			var c = 0;
			c && (c = nonce);
			eq(0,c);
			
			var d = 1;
			d && (d = nonce);
			return eq(nonce,d);
		});
		
		test("mathematical operators",function (){
			var a = [1,2,3,4];
			var b = [3,4,5,6];
			
			var u = union$(a,b);
			eq(u,[1,2,3,4,5,6]);
			
			var i = intersect$(a,b);
			return eq(i,[3,4]);
			
			// ensure that RHS is treated as a group
			// e = f = false
			// e and= f or true
			// eq false, e
		});
		
		test("compound assignment as a sub expression",function (){
			return p("no support for compound assigns yet");
			// [a, b, c] = [1, 2, 3]
			// eq 6, (a + b += c)
			// eq 1, a
			// eq 5, b
			// eq 3, c
			// #	# *note: this test could still use refactoring*
		});
		test("compound assignment should be careful about caching variables",function (){
			var $1, $2, $3, $4, $5;
			var count = 0;
			var list = [];
			
			(list[($1=++count)] == null) ? (list[$1] = 1) : (list[$1]);
			eq(1,list[1]);
			eq(1,count);
			
			(list[($2=++count)] == null) ? (list[$2] = 2) : (list[$2]);
			eq(2,list[2]);
			eq(2,count);
			
			list[($3=count++)] && (list[$3] = 6);
			eq(6,list[2]);
			eq(3,count);
			
			// TODO inside the inner scope - the outer variable sound
			// already exist -- unless we've auto-called the function?
			var base;
			
			base = function (){
				++count;
				return base;
			};
			
			(($4=base()).four == null) ? ($4.four = 4) : ($4.four);
			eq(4,base.four);
			eq(4,count);
			
			(($5=base()).five == null) ? ($5.five = 5) : ($5.five);
			eq(5,base.five);
			return eq(5,count);
		});
		
		test("compound assignment with implicit objects",function (){
			var obj = undefined;
			(obj == null) ? (obj = {one: 1}) : (obj);
			
			eq(obj.one,1);
			
			obj && (obj = {two: 2});
			
			eq(undefined,obj.one);
			return eq(2,obj.two);
		});
		
		test("compound assignment (math operators)",function (){
			var num = 10;
			num -= 5;
			eq(5,num);
			
			num *= 10;
			eq(50,num);
			
			num /= 10;
			eq(5,num);
			
			num %= 3;
			return eq(2,num);
		});
		
		test("more compound assignment",function (){
			var a = {};
			var val = undefined;
			val || (val = a);
			val || (val = true);
			eq(a,val);
			
			var b = {};
			val && (val = true);
			eq(val,true);
			val && (val = b);
			eq(b,val);
			
			var c = {};
			val = null;
			(val == null) ? (val = c) : (val);
			(val == null) ? (val = true) : (val);
			return eq(c,val);
		});
		
		
		test('a,b,c = 1,2,3',function (_0,_1,_2){
			
			var b, c, items, len, i, array, len_, j, coll, len__, k, ary_, length_, i_, ary__, $1, i__, $2, $3, $4, $5, $6, $7, $8, $9, $10, tmp, $11, $12, v_, $13, $14, $15, tmplist;
			var ary = [1,2,3,4,5];
			var obj = new O();
			
			var a = 1;
			eq(a,1);
			var b = 2,c = 3;
			eq([a,b,c],[1,2,3]);
			
			var items=iter$([2,4,6]),len=items.length,i=0;var a = items[i++],b = new Array(len - 2);while(i < len - 1){
				b[i - 1] = items[i++];
			};var c = items[i++];// should result in error, no?
			eq([a,b,c],[2,[4],6]);
			
			
			var array=iter$([2,4,6]),len_=array.length,j=0;var a = array[j++],b = array[j++],c = new Array(len_ - 2);while(j < len_){
				c[j - 2] = array[j++];
			};// should result in error, no?
			eq([a,b,c],[2,4,[6]]);
			
			var coll=iter$([1,2,3,4,5]),len__=coll.length,k=0;var a = coll[k++],b = new Array(len__ - 3);while(k < len__ - 2){
				b[k - 1] = coll[k++];
			};var c = coll[k++],d = coll[k++];// should result in error, no?
			eq([a,b,c,d],[1,[2,3],4,5]);
			
			var ary_=iter$([1,2,3,4,5]),length_=ary_.length,i_=0;var a = ary_[i_++],b = ary_[i_++],c = ary_[i_++],d = new Array(length_ - 3);while(i_ < length_){
				d[i_ - 3] = ary_[i_++];
			};// should result in error, no?
			eq([a,b,c,d],[1,2,3,[4,5]]);
			
			var ary__=iter$([1,2,3,4,5]),$1=ary__.length,i__=0;var a = new Array($1 - 3);while(i__ < $1 - 3){
				a[i__ - 0] = ary__[i__++];
			};var b = ary__[i__++],c = ary__[i__++],d = ary__[i__++];// should result in error, no?
			eq([a,b,c,d],[[1,2],3,4,5]);
			
			$2=b,$3=a,a = $2,b = $3;
			eq([a,b],[3,[1,2]]);
			
			$2=[30,a],a = 10,b = 20,c = $2;
			eq([a,b,c],[10,20,[30,3]]);
			
			var $4=iter$(ary);var a = $4[(0)],b = $4[(1)],c = $4[(2)];
			eq([a,b,c],[1,2,3]);
			
			var $5=iter$(ary),$6=$5.length,$7=0;var a = $5[$7++],b = $5[$7++],c = new Array($6 - 2);while($7 < $6){
				c[$7 - 2] = $5[$7++];
			};
			eq([a,b,c],[1,2,[3,4,5]]);
			
			var list = [10,20,30];
			
			$2=list[1],$3=list[0],list[0] = $2,list[1] = $3;
			eq(list,[20,10,30]);
			
			var $8=iter$(ary),$9=$8.length,$10=0,tmp=new Array($9 - 2);list[0] = $8[$10++];while($10 < $9 - 1){
				tmp[$10 - 1] = $8[$10++];
			};list[1] = tmp;list[2] = $8[$10++];
			eq(list,[1,[2,3,4],5]);
			
			for(var $1=0, $2=iter$(ary), $3=$2.length, res=[]; $1 < $3; $1++) {
				res.push($2[$1] * 2);
			};var x = res;
			
			eq(x,[2,4,6,8,10]);
			
			for(var $1=0, $2=iter$(ary), $3=$2.length, res=[]; $1 < $3; $1++) {
				res.push($2[$1] * 2);
			};var $11=iter$(res);x = $11[(0)];var y = $11[(1)];
			
			eq([x,y],[2,4]);
			
			for(var $1=0, $2=iter$(ary), $3=$2.length, res=[]; $1 < $3; $1++) {
				res.push($2[$1] * 2);
			};var $12=iter$(res);x = $12[(0)];y = $12[(1)];(obj.setZ(v_=$12[(2)]),v_);
			eq([x,y,obj.z()],[2,4,6]);
			
			for(var $1=0, $2=iter$(ary), $3=$2.length, res=[]; $1 < $3; $1++) {
				res.push($2[$1] * 2);
			};var $13=iter$(res),$14=$13.length,$15=0,tmplist=new Array($14 - 2);x = $13[$15++];y = $13[$15++];while($15 < $14){
				tmplist[$15 - 2] = $13[$15++];
			};(obj.setZ(tmplist),tmplist);
			eq([x,y,obj.z()],[2,4,[6,8,10]]);
			
			// special case for arguments
			a = _0,b = _1,c = _2;
			return;
		});
		
		test('a,b,c = x,y,z',function (){
			var a, b, c, $1, $2, $3, x, y;
			var o = {x: 0,y: 1,z: 2};
			var a = o.x,b = o.y,c = o.z;
			eq([a,b,c],[0,1,2]);
			
			// tuples should be preevaluated
			var v = 0;
			var $1=(v = 5),$2=v,$3=v,a = $1,b = $2,c = $3;
			eq([a,b,c],[5,5,5]);
			
			var x = 10,y = 20;
			$1=y,$2=x,x = $1,y = $2;
			eq([x,y],[20,10]);
			
			x = 10,y = 20;
			$1=(x += 20,y),$2=x,x = $1,y = $2;
			eq([x,y],[20,30]);
			
			var fn = function (){
				x = 100;
				return 10;
			};
			
			// how are we supposed to handle this?
			x = 10,y = 20;
			$1=fn(),$2=x,x = $1,y = $2;
			return eq([x,y],[10,100]);
		});
		
		test('.a,.b = x,y',function (){
			// b will nececarrily need to be set after a is set
			var z_, a, b, c, i, $1, $2;
			/* @class A */
			function A(){
				this._x = 0;
				this._y = 0;
				this._z = 0;
			};
			
			
			A.prototype.__x = {};
			A.prototype.x = function(v){ return this._x; }
			A.prototype.setX = function(v){ this._x = v; return this; };
			
			A.prototype.__y = {};
			A.prototype.y = function(v){ return this._y; }
			A.prototype.setY = function(v){ this._y = v; return this; };
			
			A.prototype.__z = {};
			A.prototype.z = function(v){ return this._z; }
			A.prototype.setZ = function(v){ this._z = v; return this; };
			
			
			
			// accessing x will increment y
			// def x
			// 	@x
			
			A.prototype.setX = function (x){
				(this._z)++;
				return this._x = x;
			};
			
			
			// o.x should not be set before we get o.z
			// if the left side was vars however, we could do it the easy way
			var o = new A();
			z_=o.z(),o.setX(1),(o.setY(z_),z_);
			eq([o.x(),o.y()],[1,0]);
			
			// now predefine local variables
			var a = 0,b = 0,c = 0,i = 0;
			var m = function (){
				return a + b + c;
			};
			z_=m(),$1=m(),$2=m(),a = z_,b = $1,c = $2;
			return eq([a,b,c],[0,0,0]);
		});
		
		test('tuples - edgecase',function (){
			var b, c, i, $1, $2, a;
			var b = 0,c = 0,i = 0;
			var m = function (){
				return (++i) + b + c;
			};
			
			// since a is not predefined, it is safe to evaluate this directly
			// while the values for b and c must be precached before assignment
			var a = m(),$1=m(),$2=m(),b = $1,c = $2;
			return eq([a,b,c],[1,2,3]);
		});
		
		return test('tuples - edgecase 2',function (){
			var a, c, i, $1, $2, $3, b;
			var a = 0,c = 0,i = 0;
			
			var m = function (){
				a = 10;
				return (++i) + a + c;
			};
			
			// since a is not predefined, it is safe to evaluate this directly
			// while the values for b and c must be precached before assignment
			// here a is predefined AND evals to a value
			var $1=m(),$2=m(),$3=m(),a = $1,b = $2,c = $3;
			return eq([a,b,c],[11,12,13]);
		});
	});
	
	// #
	// # Destructuring Assignment
	// #	test "empty destructuring assignment" do
	// 	{} = [] = undefined
	// #	test "chained destructuring assignments" do
	// 	[a] = {0: b} = {'0': c} = [nonce={}]
	// 	eq nonce, a
	// 	eq nonce, b
	// 	eq nonce, c
	// #	test "variable swapping to verify caching of RHS values when appropriate" do
	// 	a = nonceA = {}
	// 	b = nonceB = {}
	// 	c = nonceC = {}
	// 	[a, b, c] = [b, c, a]
	// 	eq nonceB, a
	// 	eq nonceC, b
	// 	eq nonceA, c
	// 	[a, b, c] = [b, c, a]
	// 	eq nonceC, a
	// 	eq nonceA, b
	// 	eq nonceB, c
	// #		fn = ->
	// 		[a, b, c] = [b, c, a]
	// #		eq [nonceA,nonceB,nonceC], fn()
	// 	eq nonceA, a
	// 	eq nonceB, b
	// 	eq nonceC, c
	// #	test "#713", ->
	// 	nonces = [nonceA={},nonceB={}]
	// 	eq nonces, [a, b] = [c, d] = nonces
	// 	eq nonceA, a
	// 	eq nonceA, c
	// 	eq nonceB, b
	// 	eq nonceB, d
	// #	# Existential Assignment
	// test "existential assignment" do
	// 	nonce = {}
	// 	a = false
	// 	a ?= nonce
	// 	eq false, a
	// 	b = undefined
	// 	b ?= nonce
	// 	eq nonce, b
	// 	c = null
	// 	c ?= nonce
	// 	eq nonce, c
	// 	d ?= nonce
	// 	eq nonce, d
	// #	test "#1348, #1216: existential assignment compilation" do
	// 	nonce = {}
	// 	a = nonce
	// 	b = (a ?= 0)
	// 	eq nonce, b
	// 	# the first ?= compiles into a statement; the second ?= compiles to a ternary expression
	// 	eq a ?= b ?= 1, nonce
	// 	
	// 	e ?= f ?= g ?= 1
	// 	eq e + g, 2
	// 	
	// 	# need to ensure the two vars are not defined, hence the strange names;
	// 	# broke earlier when using c ?= d ?= 1 because `d` is declared elsewhere
	// 	eq und1_1348 ?= und2_1348 ?= 1, 1
	// 	
	// 	if a then a ?= 2 else a = 3
	// 	eq a, nonce
	// 


}())