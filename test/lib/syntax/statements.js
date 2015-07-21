(function(){


	function union$(a,b){
		if(a && a.__union) return a.__union(b);
	
		var u = a.slice(0);
		for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);
		return u;
	};
	
	var ary = [1,2,3];
	for (var rets = [], i=0, len=ary.length; i < len; i++) {
		rets.push(ary[i] + 1);
	};
	
	var str = ("" + (ary[0]) + " " + (ary[1]) + " " + (ary[2]));
	
	
	
	
	describe("Syntax - Statements",function() {
		
		return test("allow statements as arguments",function() {
			
			var fn = function() {
				var $0 = arguments, i = $0.length;
				var pars = new Array(i>0 ? i : 0);
				while(i>0) pars[i-1] = $0[--i];
				return pars;
			};
			var ary = [1,2,3,4];
			var res = fn(10,((function() {
				for (var i=0, len=ary.length, res=[]; i < len; i++) {
					res.push(ary[i] * 2);
				};
				return res;
			})()),20);
			eq(res,[10,[2,4,6,8],20]);
			
			// unsure
			// 10 + try 10 catch e 10
			// since ary and fn are local, we can go all the way
			// up to cache it before.
			
			res = fn(union$(ary,((function() {
				for (var i=0, len=ary.length, res=[]; i < len; i++) {
					res.push(ary[i] * 2);
				};
				return res;
			})())));
			
			var outer = 0;
			// when using statements as arguments, they might be
			// moved up into the statement and cache, but it needs
			// to happen in the expected order
			return /* @class Obj */
			function Obj(){ };
			
			Obj.obj = function (){
				return new this();
			};
			Obj.prototype.test = function (arg){
				return arg;
			};
			
			
			// res = Obj.new.test ((outer = v) for v in ary)
		});
	});


}())