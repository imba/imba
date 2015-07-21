(function(){


	// externs;
	
	/* @class A */
	function A(a,b){
		this._a = a;
		this._b = b;
		this._c = 1;
		this._d = 1;
		this._e = 1;
		this._f = 1;
	};
	
	
	A.prototype.__a = {name: 'a'};
	A.prototype.a = function(v){ return this._a; }
	A.prototype.setA = function(v){ this._a = v; return this; };
	
	A.prototype.__b = {name: 'b'};
	A.prototype.b = function(v){ return this._b; }
	A.prototype.setB = function(v){ this._b = v; return this; };
	
	A.prototype.__c = {name: 'c'};
	A.prototype.c = function(v){ return this._c; }
	A.prototype.setC = function(v){ this._c = v; return this; };
	
	A.prototype.__d = {name: 'd'};
	A.prototype.d = function(v){ return this._d; }
	A.prototype.setD = function(v){ this._d = v; return this; };
	
	A.prototype.__e = {name: 'e'};
	A.prototype.e = function(v){ return this._e; }
	A.prototype.setE = function(v){ this._e = v; return this; };
	
	A.prototype.__f = {name: 'f'};
	A.prototype.f = function(v){ return this._f; }
	A.prototype.setF = function(v){ this._f = v; return this; };
	
	
	
	A.prototype.call = function (fn){
		var other = new A(2,2);
		fn.call(other);
		return this;
	};
	
	A.prototype.test = function (){
		var self=this;
		var res = [self.a(),this.a()];
		self.call(function() {
			res.push(self.a());
			res.push(this.a());
			// loops create their own scope, but should still
			// have the outermost closed scope as their implicit context
			for (var i=0, ary=[1], len=ary.length, res1=[]; i < len; i++) {
				res.push(self.a());
				res1.push(res.push(this.a()));
			};
			return res1;
		});
		return res;
	};
	
	A.prototype.innerDef = function (){
		var ary = [];
		
		// def inside a method scope creates a local function
		// which is implicitly called.
		
		function recur(i){
			ary.push(i);
			if (i < 5) { return recur(i + 1) };
		};
		
		recur(0);
		eq(ary,[0,1,2,3,4,5]);
		
		var k = 0;
		function implicit(){
			ary.push(k);
			if (++k < 6) { return implicit() };
		};
		
		implicit();
		return eq(ary,[0,1,2,3,4,5,0,1,2,3,4,5]);
	};
	
	
	A.prototype.letVar = function (){
		var ary = [1,2,3];
		var a = 1;
		var b = 1;
		var len = 1;
		var i = 1;
		var v = 1;
		
		for (var i1=0, len_=ary.length; i1 < len_; i1++) {
			ary[i1] + 2;
			i1;
		};
		
		eq(i,1);
		
		if (true) {
			for (var i2=0, len_=ary.length; i2 < len_; i2++) {
				i2;
			};
			eq(i,1);
		};
		
		for (var r = [], j=0, len_=ary.length; j < len_; j++) {
			r.push(ary[j]);
		};
		
		r.length;
		
		for (var j=0, len_=ary.length; j < len_; j++) {
			var l = 1;
			var a1 = 2;
			var b1 = 2;
			var c = 2;
			var h = 0;
			a1 + b1 + c;
		};
		
		for (var j=0, len_=ary.length; j < len_; j++) {
			var a2 = 3;
			var b2 = 3;
			var c1 = 3;
			this.f();
		};
		
		if (true) {
			var a3 = 4;
			var b3 = 4;
			var i3 = 0;
			var len1 = 10;
			
			if (true) {
				var a4 = 5;
				var b4 = 5;
			};
			
			for (var e = [], i4=0, len_=ary.length; i4 < len_; i4++) {
				eq(a3,4);
				e.push(i4);
			};
			
			eq(a3,4);
			eq(i3,0);
		} else {
			var a5 = 4,b5 = 4,d = 4;
			true;
		};
		
		if (1) {
			for (var j=0, len_=ary.length; j < len_; j++) {
				true;
			};
			var z = 4;
		} else {
			z = 5;
		};
		
		eq(v,1);
		eq(i,1);
		eq(len,1);
		eq(a + b + this.c() + this.d() + this.e() + this.f(),6);
		return;
		// console.log A.new.test
	};
	
	
	
	describe("Syntax - Scope",function() {
		var item = new A(1,1);
		
		test("nested scope",function() {
			var obj = new A(1,1);
			var res = obj.test();
			return eq(res,[1,1,1,2,1,2]);
		});
		
		test("def inside method",function() {
			return item.innerDef();
		});
		
		test("blocklocal variables (let)",function() {
			return item.letVar();
		});
		
		test("class",function() {
			var x = 10;
			/* @class A */
			function A(){ };
			
			var x1 = 20;
			
			A.prototype.test = function (){
				eq(x1,20);
				x1 += 10;
				return eq(x1,30);
			};
			
			
			eq(x,10);
			new A().test();
			return eq(x,10);
		});
		
		return test("let",function() {
			var a = 0;
			if (true) {
				var a1 = 1;
				eq(a1,1);
			};
			return eq(a,0);
		});
	});


}())