(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// self = SPEC
	
	/* @class SyntaxLoopsObj */
	function SyntaxLoopsObj(){ };
	
	
	SyntaxLoopsObj.prototype.__value = {};
	SyntaxLoopsObj.prototype.value = function(v){ return this._value; }
	SyntaxLoopsObj.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	/* @class IterableObject */
	function IterableObject(){
		this;
	};
	
	
	
	IterableObject.prototype.toArray = function (){
		return [1,2,3,4,5];
	};
	
	
	
	describe('Syntax - Loops',function (){
		var ary = [1,2,3,4,5];
		var ary2 = [2,4,6,8,10];
		var dict = {a: 2,b: 4,c: 6,d: 8};
		var dict2 = Object.create(dict);
		dict2.e = 10;
		
		var obj = new SyntaxLoopsObj();
		
		describe("For In",function (){
			
			test("quirks",function (){
				var i = 10;
				var a = [1,2,3];
				var sum = 0;
				
				// i should be local here - or at least be reset
				for(var i1=0, items=iter$(a), len=items.length; i1 < len; i1++) {
					sum += i1;
				};
				
				return eq(sum,0 + 1 + 2);
			});
			
			
			
			
			test("basic assignment",function (){
				for(var i=0, items=iter$(ary), len=items.length, res=[]; i < len; i++) {
					res.push(items[i] + 1);
				};var rets = res;
				return eq(rets,[2,3,4,5,6],String);
			});
			
			test("forin with conditional assign",function (){
				var value_, $1;
				var ret;
				
				obj.setValue(1);
				
				if(!(value_=(obj.value()))) {
					for(var i=0, items=iter$(ary), len=items.length, res=[]; i < len; i++) {
						res.push(items[i] + 1);
					};ret = (obj.setValue(res),res);
				} else {
					ret = value_
				};
				
				eq(ret,1,String);
				
				if($1=obj.value()) {
					for(var i=0, items=iter$(ary), len=items.length, res=[]; i < len; i++) {
						res.push(items[i] * 1);
					};ret = (obj.setValue(res),res);
				} else {
					ret = $1
				};
				
				eq(ret,obj.value(),String);
				return eq(obj.value(),ary,String);
			});
			
			test("inside statement",function (){
				var value_, v_;
				obj.setValue(null);
				if((value_=obj.value()) == null) {
					if(1) {
						for(var i=0, items=iter$(ary), len=items.length, res=[]; i < len; i++) {
							res.push(items[i] * 2);
						};var ret = (obj.setValue(res),res);
					} else {
						ret = (obj.setValue(v_=2),v_);
					}
				} else {
					ret = value_
				};
				
				eq(ret,ary2,String);
				return eq(obj.value(),ary2,String);
			});
			
			test("custom iterable objects",function (){
				var item = new IterableObject();
				for(var i=0, items=iter$(item), len=items.length, res1=[]; i < len; i++) {
					res1.push(items[i] * 2);
				};var res = res1;
				return eq(res,[2,4,6,8,10]);
			});
			
			return test("forin by",function (){
				var ary = [1,2,3,4,5,6];
				for(var i=0, items=iter$(ary), len=items.length, res1=[]; i < len; i = i + 2) {
					res1.push(items[i]);
				};var res = res1;
				return eq(res,[1,3,5]);
			});
		});
		
		describe("For In with ranges",function (){
			
			test("statement",function (){
				var ary = [];
				for(var len=3, i=0; i <= len; i++) {
					ary.push(i);
				};
				return eq(ary,[0,1,2,3]);
			});
			
			return test("expression",function (){
				for(var len=3, i=0, res=[]; i <= len; i++) {
					res.push(i * 2);
				};var a = res;
				eq(a,[0,2,4,6]);
				
				for(var len=3, i=0, a=[]; i < len; i++) {
					a.push(i * 2);
				};a;
				return eq(a,[0,2,4]);
			});
		});
		
		
		describe("For Of",function (){
			
			test("all keys assignment",function (){
				var o=dict, k, res=[];
				for(var k in o){
					res.push(k);
				};var keys = res;
				eq(keys,['a','b','c','d'],String);
				
				var o=dict, k, res=[];
				for(var k in o){
					res.push(o[k]);
				};var vals = res;
				eq(vals,[2,4,6,8]);
				
				// The order of the keys are based on assignment-order,
				// prototype-keys always come at the end (as if they were assigned
				// after all other keys=
				var o=dict2, k, keys=[];
				for(var k in o){
					keys.push(k);
				};keys;
				return eq(keys,['e','a','b','c','d']);
			});
			
			return test("for own of",function (){
				for(var o=dict, i=0, keys=Object.keys(o), l=keys.length, res=[]; i < l; i++){
					res.push(keys[i]);
				};var keys = res;
				eq(keys,['a','b','c','d'],String);
				
				for(var o=dict2, i=0, keys1=Object.keys(o), l=keys1.length, keys=[]; i < l; i++){
					keys.push(keys1[i]);
				};keys;
				for(var o=dict2, i=0, keys1=Object.keys(o), l=keys1.length, res=[]; i < l; i++){
					res.push(o[keys1[i]]);
				};var vals = res;
				eq(keys,['e']);
				return eq(vals,[10]);
			});
		});
		
		test("implicit return from assignment",function (){
			var c = 1;
			var f = function (){
				return (c) ? (true) : (false);
			};
			return eq(f(),true);
		});
		
		test("while",function (){
			var a = [];
			while(a.length < 5){
				a.push(a.length);
			};
			eq(a,[0,1,2,3,4]);
			
			a = [];
			while(a.length < 5){
				a.push(a.length);
			};
			return eq(a,[0,1,2,3,4]);
		});
		
		return describe("Loop",function (){
			
			return it("should work",function (){
				var a, b;
				var a = 0,b = 0;
				while(true){
					a++;
					if(b == 0) {
						break;
					};
				};
				
				return eq(a,1);
			});
		});
	});
	
	
	
	// 
	// 	# n = a ?= b = c = d = if 1
	// 	# 	if 2
	// 	# 		v
	// 	# 	else
	// 	# 		return
	// 	# else
	// 	# 	2
	// 	# return
	// 	
	// 	# a is a setter
	// 	# must be statement because of return
	// 	a = b = c ?= if x
	// 		v1
	// 	else
	// 		if y
	// 			m1
	// 			return 2
	// 		else
	// 			m1
	// 			v2 1, 2, 3
	// 
	// 	return 2
	// 
	// 	# can wrap the assignment in a localvar-assignment
	// 	# caching the result of the expression
	// 	# return cached result after this block
	// 
	// def ok
	// 	var ary = [1,2,3,4,5]
	// 	var ret = null
	// 
	// 	ret = if okay
	// 		for x,i in ary
	// 			i > 2 ? x * 10 : x * 2 
	// 			
	// 		20
	// 	else
	// 		20
	// 


}())