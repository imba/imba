(function(){

SyntaxLoopsObj = imba$class(function SyntaxLoopsObj(){
	
	return this;
});
SyntaxLoopsObj.prototype.value = function (){
	
	return this._value;
};
SyntaxLoopsObj.prototype.setValue = function (v){
	
	return this._value = v;
};
IterableObject = imba$class(function IterableObject(){
	
	this;
});
IterableObject.prototype.toArray = function (){
	
	return [1, 2, 3, 4, 5];
};
console.log("syntax loop");

describe('Syntax - Loops',function (){
	
	var ary = [1, 2, 3, 4, 5];
	var ary2 = [2, 4, 6, 8, 10];
	var dict = {a: 2,b: 4,c: 6,d: 8};
	var dict2 = Object.create(dict);
	dict2.e = 10;
	
	var obj = new SyntaxLoopsObj();
	
	describe("For In",function (){
		
		test("basic assignment",function (){
			
			for(var i = 0, items = iter$(ary), len = items.length, v, res = []; i < len; i = i + 1){
				v = items[i];
				res.push(v + 1);
			};
			var rets = res;
			return eq(rets,[2, 3, 4, 5, 6],String);
		});
		test("forin with conditional assign",function (){
			var value0, $1;
			var ret;
			
			obj.setValue(1);
			
			if(!(value0 = (obj.value()))) {
				for(var i = 0, items = iter$(ary), len = items.length, v, res = []; i < len; i = i + 1){
					v = items[i];
					res.push(v + 1);
				};
				ret = obj.setValue(res);
			} else {
				ret = value0
			};
			eq(ret,1,String);
			
			if($1 = obj.value()) {
				for(var i = 0, items = iter$(ary), len = items.length, v, res = []; i < len; i = i + 1){
					v = items[i];
					res.push(v * 1);
				};
				ret = obj.setValue(res);
			} else {
				ret = $1
			};
			eq(ret,obj.value(),String);
			return eq(obj.value(),ary,String);
		});
		test("inside statement",function (){
			var value0;
			obj.setValue(null);
			if((value0 = obj.value()) == null) {
				if(1) {
					for(var i = 0, items = iter$(ary), len = items.length, v, res = []; i < len; i = i + 1){
						v = items[i];
						res.push(v * 2);
					};
					var ret = obj.setValue(res);
				} else {
					ret = obj.setValue(2);
				}
			} else {
				ret = value0
			};
			eq(ret,ary2,String);
			return eq(obj.value(),ary2,String);
		});
		test("custom iterable objects",function (){
			
			var item = new IterableObject();
			for(var i = 0, items = iter$(item), len = items.length, v, res1 = []; i < len; i = i + 1){
				v = items[i];
				res1.push(v * 2);
			};
			var res = res1;
			return eq(res,[2, 4, 6, 8, 10]);
		});
		return test("forin by",function (){
			
			var ary = [1, 2, 3, 4, 5, 6];
			for(var i = 0, items = iter$(ary), len = items.length, v, res1 = []; i < len; i = i + 2){
				v = items[i];
				res1.push(v);
			};
			var res = res1;
			return eq(res,[1, 3, 5]);
		});
	});
	describe("For Of",function (){
		
		test("all keys assignment",function (){
			
			var k, o = dict, v, res = [];for(k in o){
				v = o[k];
				res.push(k);
			};
			var keys = res;
			eq(keys,['a', 'b', 'c', 'd'],String);
			
			var k, o = dict, v, res = [];for(k in o){
				v = o[k];
				res.push(v);
			};
			var vals = res;
			eq(vals,[2, 4, 6, 8]);
			var k, o = dict2, v, keys = [];for(k in o){
				v = o[k];
				keys.push(k);
			};
			keys;
			return eq(keys,['e', 'a', 'b', 'c', 'd']);
		});
		return test("for own of",function (){
			
			for(var k, o = dict, v, i = 0, keys = Object.keys(o), l = keys.length, res = []; i < l; i = i + 1){
				k = keys[i];
				v = o[k];
				res.push(k);
			};
			var keys = res;
			eq(keys,['a', 'b', 'c', 'd'],String);
			
			for(var k, o = dict2, v, i = 0, keys1 = Object.keys(o), l = keys1.length, keys = []; i < l; i = i + 1){
				k = keys1[i];
				v = o[k];
				keys.push(k);
			};
			keys;
			for(var k, o = dict2, val, i = 0, keys1 = Object.keys(o), l = keys1.length, res = []; i < l; i = i + 1){
				k = keys1[i];
				val = o[k];
				res.push(val);
			};
			var vals = res;
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
		eq(a,[0, 1, 2, 3, 4]);
		
		a = [];
		while(a.length < 5){
			a.push(a.length);
		};
		return eq(a,[0, 1, 2, 3, 4]);
	});
	return describe("Loop",function (){
		
		return it("should work",function (){
			var a, b;
			var a = 0, b = 0;
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
}())