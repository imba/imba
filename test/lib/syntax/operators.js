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
	
	idx$ = function(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	// package imba.ast
	
	/* @class Cache */
	function Cache(val){
		this._gets = 0;
		this._value = val;
	};
	
	
	Cache.prototype.__gets = {};
	Cache.prototype.gets = function(v){ return this._gets; }
	Cache.prototype.setGets = function(v){ this._gets = v; return this; };
	
	
	
	Cache.prototype.value = function (){
		(this._gets)++;
		return this._value;
	};
	
	
	/* @class Group */
	function Group(items){
		this._items = items;
	};
	
	
	Group.prototype.__items = {};
	Group.prototype.items = function(v){ return this._items; }
	Group.prototype.setItems = function(v){ this._items = v; return this; };
	
	Group.prototype.toString = function (){
		return this._items.toString();
	};
	Group.prototype.__union = function (other){
		return new Group(union$(this._items,other.items()));
	};
	Group.prototype.__intersect = function (other){
		return new Group(intersect$(this._items,other.items()));
	};
	
	
	describe('Syntax - Operators',function (){
		
		test("union and intersect",function (){
			
			// union regular arrays
			var a = [1,2,3,6];
			var b = [3,4,5,6];
			eq(union$(a,b),[1,2,3,6,4,5]);
			eq(intersect$(a,b),[3,6]);
			
			// union custom objects
			var ga = new Group([4,5,6]);
			var gb = new Group([5,6,7]);
			var gc = new Group([8,9]);
			var gd = (union$(ga,gb));
			
			ok(gd instanceof Group);
			eq(gd.items(),[4,5,6,7]);
			
			gd = intersect$(ga,gb);
			ok(gd instanceof Group);
			eq(gd.items(),[5,6]);
			
			eq((intersect$(gb,gc)).items(),[]);
			
			// precedence
			gd = union$(intersect$(ga,gb),gc);// precedence right
			// gd = ((ga ∩ gb) ∪ gc)
			eq(gd,[5,6,8,9]);
			
			gd = union$(intersect$(ga,gb),gc) && ga;
			// gd = ((ga ∩ gb) ∪ gc) && true
			return eq(gd,ga);
		});
		
		
		test("in",function (){
			var a = 5;
			var ary = [1,2,3,4,5];
			
			ok(idx$(a,ary) >= 0);
			eq(idx$(3,ary) >= 0,true);
			eq(idx$(10,ary) >= 0,false);
			eq(idx$(3,[1,2,3,4]) >= 0,true);
			eq(idx$(6,[1,2,3,4]) >= 0,false);
			
			return ok(idx$(6,ary) == -1);
		});
		
		
		test("comparison",function (){
			
			var $1, value_, $2;
			var a = 50;
			ok(100 > a && a > 10);
			eq(100 > ($1=(a = 10)) && $1 > 10,false);// not elegant
			ok(100 > a && a < 50);
			
			var b = new Cache(10);
			ok(100 > (value_=b.value()) && value_ > 2);
			ok(b.gets() == 1);
			
			ok(100 > ($2=b.value()) && $2 < 30);
			return ok(b.gets() == 2);
		});
		
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
		return test("precedence",function (){
			
			ok(10 + 10 * 2,30);
			ok((10 + 10) * 2,40);
			
			var a = 0;
			var b = 0;
			var c = 0;
			
			a = 10 + 20;
			eq(a,30);
			
			(a = 10) + 20;
			eq(a,10);
			b = 10 + (a = 5);
			eq(b,15);
			eq(a,5);
			
			a = 0;
			if(!(true || true)) {
				a = 10;
			};
			return eq(a,0);
		});
	});
	
	
	
	
	
	
	// test "binary (2-ary) math operators do not require spaces" do
	// 	a = 1
	// 	b = -1
	// 	eq +1, a*-b
	// 	eq -1, a*+b
	// 	eq +1, a/-b
	// 	eq -1, a/+b
	// #	# NO NO NO - this is an indentation-based language
	// test "operators should respect new lines as spaced" do
	// 	a = 123 +
	// 	456
	// 	eq 579, a
	//   
	// 	b = "1{2}3" +
	// 	"456"
	// 	eq '123456', b
	// #	test "multiple operators should space themselves" do
	// 	eq (+ +1), (- -1)
	// #	test "bitwise operators" do
	// 	eq  2, (10 &   3)
	// 	eq 11, (10 |   3)
	// 	eq  9, (10 ^   3)
	// 	eq 80, (10 <<  3)
	// 	eq  1, (10 >>  3)
	// 	eq  1, (10 >>> 3)
	// #	test "`instanceof`" do
	// 	# should new-syntax even work?
	// 	ok String.new instanceof String
	// 	ok Boolean.new instanceof Boolean
	// 	# `instanceof` supports negation by prefixing the operator with `not`
	// 	# find a better way - no?
	// 	ok Number.new not instanceof String
	// 	ok Array.new not instanceof Boolean
	// #	# Ternary Operator
	// #	test "ternary operator" do
	//   
	// 	a = yes
	// 	b = no
	// 	
	// 	res = a ? 1 : 0
	// 	eq res, 1
	// 	
	// 	res = b ? 1 : 0
	// 	eq res, 0
	// #		res = b && yes ? 1 : 0
	// 	eq res, 0
	// #		res = b && yes ? 1 : a && yes ? 2 : 0
	// 	eq res, 2
	// #
	// #
	// # `is`,`isnt`,`==`,`!=`
	// #	test "`==` and `is` should be interchangeable" do
	// 	a = b = 1
	// 	ok a is 1 and b == 1
	// 	ok a == b
	// 	ok a is b
	// #	test "`!=` and `isnt` should be interchangeable" do
	// 	a = 0
	// 	b = 1
	// 	ok a isnt 1 and b != 0
	// 	ok a != b
	// 	ok a isnt b
	// #
	// # [not] in/of
	// #	# - `in` should check if an array contains a value using `indexOf`
	// # - `of` should check if a property is defined on an object using `in`
	// test "in, of" do
	// 	arr = [1]
	// 	ok 0 of arr
	// 	ok 1 in arr
	// 	# prefixing `not` to `in and `of` should negate them
	// 	ok 1 not of arr
	// 	ok 0 not in arr
	// #	test "`in` should be able to operate on an array literal" do
	// 	ok 2 in [0, 1, 2, 3]
	// 	ok 4 not in [0, 1, 2, 3]
	// 	arr = [0, 1, 2, 3]
	// 	ok 2 in arr
	// 	ok 4 not in arr
	// 	# should cache the value used to test the array
	// 	arr = [0]
	// 	val = 0
	// 	ok val++ in arr
	// 	ok val++ not in arr
	// 	val = 0
	// 	ok val++ of arr
	// 	ok val++ not of arr
	// #	test "`of` and `in` should be able to operate on instance variables" do
	// 	obj = {
	// 		list: [2,3]
	// 		in_list: (value) -> value in this:list
	// 		not_in_list: (value) -> value not in this:list
	// 		of_list: (value) -> value of this:list
	// 		not_of_list: (value) -> value not of this:list
	// 	}
	// 	ok obj.in_list 3
	// 	ok obj.not_in_list 1
	// 	ok obj.of_list 0
	// 	ok obj.not_of_list 2
	// #	test "#???: `in` with cache and `__indexOf` should work in argument lists" do
	// 	eq 1, [Object() in Array()]:length
	// #	test "#737: `in` should have higher precedence than logical operators" do
	// 	eq 1, 1 in [1] and 1
	// #	test "#768: `in` should preserve evaluation order" do
	// 	share = 0
	// 	a = -> share++ if share is 0
	// 	b = -> share++ if share is 1
	// 	c = -> share++ if share is 2
	// 	ok a() not in [b(),c()]
	// 	eq 3, share
	// #	test "#1099: empty array after `in` should compile to `false`" do
	// 	eq 1, [5 in []]:length
	// 	eq false, (-> return 0 in [])()
	// 	
	// test "#1354: optimized `in` checks should not happen when splats are present" do
	// 	a = [6, 9]
	// 	eq 9 in [3, ...a], true
	// 	
	// test "#1100: precedence in or-test compilation of `in`" do
	// 	ok 0 in [1 and 0]
	// 	ok 0 in [1, 1 and 0]
	// 	ok not (0 in [1, 0 or 1])
	// 	
	// test "#1630: `in` should check `hasOwnProperty`" do
	// 	ok undefined not in length: 1
	// 	
	// # test "#1714: lexer bug with raw range `for` followed by `in`" do
	// #     0 for 1 .. 2
	// #     ok not ('a' in ['b'])
	// # 
	// #     0 for 1 .. 2; ok not ('a' in ['b'])
	// # 
	// #     0 for 1 .. 10 # comment ending
	// #     ok not ('a' in ['b'])
	// # 
	// # test "#1099: statically determined `not in []` reporting incorrect result" do
	// #     ok 0 not in []
	// #
	// # Chained Comparison
	// #	test "chainable operators" do
	// 	ok 100 > 10 > 1 > 0 > -1
	// 	ok -1 < 0 < 1 < 10 < 100
	// #	test "`is` and `isnt` may be chained" do
	// 	ok true is not false is true is not false
	// 	ok 0 is 0 isnt 1 is 1
	// #	test "different comparison operators (`>`,`<`,`is`,etc.) may be combined" do
	// 	ok 1 < 2 > 1
	// 	ok 10 < 20 > 2+3 is 5
	// #	test "some chainable operators can be negated by `unless`" do
	// 	ok (true unless 0==10!=100)
	// #	test "operator precedence: `|` lower than `<`" do
	// 	# this is usually a method-call unless we know for a fact
	// 	# that the subject is numeric.
	// 	eq 1, 1 | 2 < 3 < 4
	// #	test "preserve references" do
	// 	a = b = c = 1
	// 	# `a == b <= c` should become `a === b && b <= c`
	// 	# (this test does not seem to test for this)
	// 	ok a == b <= c
	// #	test "chained operations should evaluate each value only once" do
	// 	a = 0
	// 	ok 1 > a++ < 1
	// 


}())