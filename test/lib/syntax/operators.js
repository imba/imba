(function(){
	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	function intersect$(a,b){
		if(a && a.__intersect) return a.__intersect(b);
		var res = [];
		for(var i=0, l=a.length; i<l; i++) {
			var v = a[i];
			if(b.indexOf(v) != -1) res.push(v);
		}
		return res;
	};
	
	function union$(a,b){
		if(a && a.__union) return a.__union(b);
	
		var u = a.slice(0);
		for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);
		return u;
	};
	
	var self=this;
	// package imba.ast
	
	function Cache(val){
		this._gets = 0;
		this._value = val;
	};
	
	
	Cache.prototype.__gets = {name: 'gets'};
	Cache.prototype.gets = function(v){ return this._gets; }
	Cache.prototype.setGets = function(v){ this._gets = v; return this; };
	
	Cache.prototype.value = function (){
		this._gets++;
		return this._value;
	};
	
	function Group(items){
		this._items = items;
	};
	
	Group.prototype.__items = {name: 'items'};
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
	
	// x if 3 > i > 0
	// x unless 3 > i > 0
	// should test if/unless inversions
	
	self.describe('Syntax - Operators',function() {
		
		self.test("union and intersect",function() {
			
			// union regular arrays
			var a = [1,2,3,6];
			var b = [3,4,5,6];
			self.eq(union$(a,b),[1,2,3,6,4,5]);
			self.eq(intersect$(a,b),[3,6]);
			
			// union custom objects
			var ga = new Group([4,5,6]);
			var gb = new Group([5,6,7]);
			var gc = new Group([8,9]);
			var gd = (union$(ga,gb));
			
			self.ok(gd instanceof Group);
			self.eq(gd.items(),[4,5,6,7]);
			
			gd = intersect$(ga,gb);
			self.ok(gd instanceof Group);
			self.eq(gd.items(),[5,6]);
			
			self.eq((intersect$(gb,gc)).items(),[]);
			
			// precedence
			gd = union$(intersect$(ga,gb),gc); // precedence right
			// gd = ((ga ∩ gb) ∪ gc)
			self.eq(gd,[5,6,8,9]);
			
			gd = union$(intersect$(ga,gb),gc) && ga;
			// gd = ((ga ∩ gb) ∪ gc) && true
			return self.eq(gd,ga);
		});
		
		
		self.test("in",function() {
			var a = 5;
			var ary = [1,2,3,4,5];
			
			self.ok(idx$(a,ary) >= 0);
			self.eq(idx$(3,ary) >= 0,true);
			self.eq(idx$(10,ary) >= 0,false);
			self.eq(idx$(3,[1,2,3,4]) >= 0,true);
			self.eq(idx$(6,[1,2,3,4]) >= 0,false);
			
			return self.ok(idx$(6,ary) == -1);
		});
		
		
		self.test("comparison",function() {
			
			var $1, value_, $2;
			var a = 50;
			self.ok(100 > a && a > 10);
			self.eq(100 > ($1=(a = 10)) && $1 > 10,false); // not elegant
			self.ok(100 > a && a < 50);
			
			var b = new Cache(10);
			self.ok(100 > (value_=b.value()) && value_ > 2);
			self.ok(b.gets() == 1);
			
			self.ok(100 > ($2=b.value()) && $2 < 30);
			return self.ok(b.gets() == 2);
		});
		
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
		self.test("precedence",function() {
			
			self.ok(10 + 10 * 2,30);
			self.ok((10 + 10) * 2,40);
			
			var a = 0;
			var b = 0;
			var c = 0;
			
			a = 10 + 20;
			self.eq(a,30);
			
			(a = 10) + 20;
			self.eq(a,10);
			b = 10 + (a = 5);
			self.eq(b,15);
			self.eq(a,5);
			
			a = 0;
			if (!(true || true)) { a = 10 };
			return self.eq(a,0);
		});
		
		return self.test("ternary",function() {
			var x = 0 || 1 ? (true) : (false);
			self.eq(x,true);
			
			x = 1 || 0 ? (false) : (true);
			self.eq(x,false);
			
			if (x = 2) {
				true;
			};
			
			return self.eq(x,2);
		});
	});
	
	

})()