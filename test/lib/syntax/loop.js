(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var self=this;
	// self = SPEC
	
	function SyntaxLoopsObj(){ };
	
	
	SyntaxLoopsObj.prototype.__value = {name: 'value'};
	SyntaxLoopsObj.prototype.value = function(v){ return this._value; }
	SyntaxLoopsObj.prototype.setValue = function(v){ this._value = v; return this; };
	
	function IterableObject(){
		this;
	};
	
	IterableObject.prototype.toArray = function (){
		return [1,2,3,4,5];
	};
	
	
	self.describe('Syntax - Loops',function() {
		var ary = [1,2,3,4,5];
		var ary2 = [2,4,6,8,10];
		var dict = {a: 2,b: 4,c: 6,d: 8};
		var dict2 = Object.create(dict);
		dict2.e = 10;
		
		var obj = new SyntaxLoopsObj();
		
		self.describe("For In",function() {
			
			self.test("quirks",function() {
				var i = 10;
				var a = [1,2,3];
				var sum = 0;
				
				// i should be local here - or at least be reset
				for (var i1=0, len=a.length; i1 < len; i1++) {
					sum += i1;
				};
				
				return self.eq(sum,0 + 1 + 2);
			});
			
			self.test("redefining var inside",function() {
				
				var breaks = [1,2,3];
				for (var i=0, len=breaks.length, br; i < len; i++) {
					br = breaks[i];
					var br = 0;
					self.eq(br,0);
				};
				
				for (var i1=0, len=breaks.length, x; i1 < len; i1++) {
					x = breaks[i1];
					x = 0;
				};
				
				self.eq(breaks,[1,2,3]);
				
				return;
			});
			
			
			self.test("basic assignment",function() {
				var o = 0,l = 0,i = 0,len = 0;
				for (var rets = [], j=0, len_=ary.length; j < len_; j++) {
					rets.push(ary[j] + 1);
				};
				self.eq(rets,[2,3,4,5,6],String);
				return self.eq(o + l + i + len,0);
			});
			
			self.test("guarded",function() {
				var items = [1,2,3,4];
				
				for (var ret = [], i=0, len=items.length, v; i < len; i++) {
					v = items[i];
					if (!(v % 2)) { continue };
					ret.push(v);
				};
				return self.eq(ret,[1,3]);
			});
			
			self.test("forin with conditional assign",function() {
				var value_, $1;
				var ret;
				
				obj.setValue(1);
				
				if (!(value_=obj.value())) { for (var i=0, len=ary.length, res=[]; i < len; i++) {
					res.push(ary[i] + 1);
				};
				ret = (obj.setValue(res),res); } else {
					ret = value_
				};
				
				self.eq(ret,1,String);
				
				if ($1=obj.value()) { for (var i=0, len=ary.length, res=[]; i < len; i++) {
					res.push(ary[i] * 1);
				};
				ret = (obj.setValue(res),res); } else {
					ret = $1
				};
				
				self.eq(ret,obj.value(),String);
				return self.eq(obj.value(),ary,String);
			});
			
			self.test("inside statement",function() {
				var value_, v_;
				obj.setValue(null);
				if ((value_=obj.value()) == null) { if (1) {
					for (var i=0, len=ary.length, res=[]; i < len; i++) {
						res.push(ary[i] * 2);
					};
					var ret = (obj.setValue(res),res);
				} else {
					ret = (obj.setValue(v_=2),v_);
				} } else {
					ret = value_
				};
				
				self.eq(ret,ary2,String);
				return self.eq(obj.value(),ary2,String);
			});
			
			self.test("custom iterable objects",function() {
				var item = new IterableObject();
				for (var res = [], i=0, items=iter$(item), len=items.length; i < len; i++) {
					res.push(items[i] * 2);
				};
				return self.eq(res,[2,4,6,8,10]);
			});
			
			return self.test("forin by",function() {
				var ary = [1,2,3,4,5,6];
				for (var res = [], i=0, len=ary.length; i < len; i = i + 2) {
					res.push(ary[i]);
				};
				return self.eq(res,[1,3,5]);
			});
		});
		
		self.describe("For In with ranges",function() {
			
			self.test("statement",function() {
				var ary = [];
				for (var len=3, i = 0; i <= len; i++) {
					ary.push(i);
				};
				return self.eq(ary,[0,1,2,3]);
			});
			
			return self.test("expression",function() {
				for (var a = [], len=3, i = 0; i <= len; i++) {
					a.push(i * 2);
				};
				self.eq(a,[0,2,4,6]);
				
				for (var a = [], len=3, i1 = 0; i1 < len; i1++) {
					a.push(i1 * 2);
				};
				return self.eq(a,[0,2,4]);
			});
		});
		
		
		self.describe("For Of",function() {
			
			self.test("all keys assignment",function() {
				var o = 0;
				var l = 0;
				var len = 0;
				
				var keys = [], v;
				for (var k in dict){
					v = dict[k];keys.push(k);
				};
				self.eq(keys,['a','b','c','d'],String);
				
				var vals = [], v;
				for (var k1 in dict){
					v = dict[k1];vals.push(v);
				};
				self.eq(vals,[2,4,6,8]);
				
				// The order of the keys are based on assignment-order,
				// prototype-keys always come at the end (as if they were assigned
				// after all other keys=
				var keys = [], v;
				for (var k2 in dict2){
					v = dict2[k2];keys.push(k2);
				};
				self.eq(keys,['e','a','b','c','d']);
				
				self.eq(o,0);
				self.eq(l,0);
				return self.eq(len,0);
			});
			
			return self.test("for own of",function() {
				for (var keys = [], v, i=0, keys1=Object.keys(dict), l1=keys1.length; i < l1; i++){
					v = dict[keys1[i]];keys.push(keys1[i]);
				};
				self.eq(keys,['a','b','c','d'],String);
				
				for (var keys = [], v, i1=0, keys2=Object.keys(dict2), l2=keys2.length; i1 < l2; i1++){
					v = dict2[keys2[i1]];keys.push(keys2[i1]);
				};
				for (var vals = [], i2=0, keys3=Object.keys(dict2), l3=keys3.length; i2 < l3; i2++){
					vals.push(dict2[keys3[i2]]);
				};
				self.eq(keys,['e']);
				self.eq(vals,[10]);
				
				var l = 0;
				var len = 0;
				
				function d(){
					return {obj: {a: 1,b: 2,c: 3}};
				};
				
				function m(o){
					for (var o1=d().obj, i3=0, keys4=Object.keys(o1), l4=keys4.length; i3 < l4; i3++){
						o.push(keys4[i3],o1[keys4[i3]]);
					};
					return;
				};
				
				var v = [];
				m(v);
				return self.eq(v,['a',1,'b',2,'c',3]);
			});
		});
		
		
		self.test("implicit return from assignment",function() {
			var c = 1;
			var f = function() { return c ? (true) : (false); };
			return self.eq(f(),true);
		});
		
		self.test("while",function() {
			var a = [];
			while (a.length < 5){
				a.push(a.length);
			};
			self.eq(a,[0,1,2,3,4]);
			
			a = [];
			while (a.length < 5){
				a.push(a.length);
			};
			return self.eq(a,[0,1,2,3,4]);
		});
		
		return self.describe("Loop",function() {
			
			return self.it("should work",function() {
				var a = 0;
				var b = 0;
				while (true){
					a++;
					if (b == 0) { break };
				};
				
				return self.eq(a,1);
			});
		});
	});
	
	

})()