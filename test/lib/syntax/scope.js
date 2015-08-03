(function(){


	
	// externs;
	
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
		
		for (var i=0, len_=ary.length; i < len_; i++) {
			ary[i] + 2;
			i;
		};
		
		eq(i,1);
		
		if (true) {
			for (var i=0, len_=ary.length; i < len_; i++) {
				i;
			};
			eq(i,1);
		};
		
		for (var r = [], j=0, len_=ary.length; j < len_; j++) {
			r.push(ary[j]);
		};
		
		r.length;
		
		for (var j=0, len_=ary.length; j < len_; j++) {
			var l = 1;
			var a = 2;
			var b = 2;
			var c = 2;
			var h = 0;
			a + b + c;
		};
		
		for (var j=0, len_=ary.length; j < len_; j++) {
			var a = 3;
			var b = 3;
			var c = 3;
			this.f();
		};
		
		if (true) {
			var a1 = 4;
			var b1 = 4;
			var i1 = 0;
			var len1 = 10;
			
			if (true) {
				var a2 = 5;
				var b2 = 5;
			};
			
			for (var e = [], i=0, len_=ary.length; i < len_; i++) {
				eq(a1,4);
				e.push(i);
			};
			
			eq(a1,4);
			eq(i1,0);
		} else {
			var a3 = 4,b3 = 4,d = 4;
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
	};
	
	A.prototype.caching = function (){
		
		var f;
		if (f = this.f()) {
			eq(f,this._f);
		} else {
			eq(1,0);
		};
		return this;
	};
	
	
	// console.log A.new.test
	
	
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
			function A(){ };var x1 = 20;
			
			A.prototype.test = function (){
				eq(x1,20);
				x1 += 10;
				return eq(x1,30);
			};
			
			
			eq(x,10);
			new A().test();
			return eq(x,10);
		});
		
		test("let",function() {
			var a = 0;
			if (true) {
				var a1 = 1;
				eq(a1,1);
			};
			return eq(a,0);
		});
		
		return test("caching",function() {
			return new A().caching();
		});
	});


}())