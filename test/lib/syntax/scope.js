(function(){


	// externs;
	
	/* @class A */
	function A(a,b){
		this._a = a;
		this._b = b;
	};
	
	
	A.prototype.__a = {};
	A.prototype.a = function(v){ return this._a; }
	A.prototype.setA = function(v){ this._a = v; return this; };
	
	A.prototype.__b = {};
	A.prototype.b = function(v){ return this._b; }
	A.prototype.setB = function(v){ this._b = v; return this; };
	
	
	
	A.prototype.call = function (fn){
		var other = new A(2,2);
		fn.call(other);
		return this;
	};
	
	A.prototype.test = function (){
		var self=this;
		var res = [self.a(),this.a()];
		self.call(function (){
			res.push(self.a());
			res.push(this.a());
			// loops create their own scope, but should still
			// have the outermost closed scope as their implicit context
			for(var i=0, ary=[1], len=ary.length, res1=[]; i < len; i++) {
				res.push(self.a());
				res1.push(res.push(this.a()));
			};return res1;
		});
		return res;
	};
	
	A.prototype.innerDef = function (){
		var ary = [];
		
		// def inside a method scope creates a local function
		// which is implicitly called.
		
		function recur(i){
			ary.push(i);
			return (i < 5) && (recur(i + 1));
		};
		
		recur(0);
		eq(ary,[0,1,2,3,4,5]);
		
		var k = 0;
		function implicit(){
			ary.push(k);
			return (++k < 6) && (implicit());
		};
		
		implicit();
		return eq(ary,[0,1,2,3,4,5,0,1,2,3,4,5]);
	};
	
	
	
	
	
	
	describe("Syntax - Scope",function (){
		var item = new A(1,1);
		
		test("nested scope",function (){
			var obj = new A(1,1);
			var res = obj.test();
			return eq(res,[1,1,1,2,1,2]);
		});
		
		test("def inside method",function (){
			return item.innerDef();
		});
		
		return test("class",function (){
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
	});


}())