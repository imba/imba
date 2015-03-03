(function(){
var ary = [1, 2, 3];
for(var i = 0, items = iter$(ary), len = items.length, v, res = []; i < len; i = i + 1){
	v = items[i];
	res.push(v + 1);
};
var rets = res;;
var str = ("" + (ary[0]) + " " + (ary[1]) + " " + (ary[2]));
describe("Syntax - Statements",function (){
	return test("allow statements as arguments",function (){
		var fn = function (){
			var $0 = arguments, i = $0.length;
			var pars = new Array(i>0 ? i : 0);
			while(i>0) pars[i-1] = $0[--i];;
			return pars;
		};
		var ary = [1, 2, 3, 4];
		var res = fn(10,((function (){
			for(var i = 0, items = iter$(ary), len = items.length, v, res1 = []; i < len; i = i + 1){
				v = items[i];
				res1.push(v * 2);
			};
			return res1;;
		})()),20);
		eq(res,[10, [2, 4, 6, 8], 20]);
		res = fn(union$(ary,((function (){
			for(var i = 0, items = iter$(ary), len = items.length, v, res1 = []; i < len; i = i + 1){
				v = items[i];
				res1.push(v * 2);
			};
			return res1;;
		})())));
		var outer = 0;
		return function Obj(){
			return this;
		};
		imba$class(Obj);
		Obj.obj = function (){
			return new this();
		};
		Obj.prototype.test = function (arg){
			return arg;
		};;
	});
});
}())