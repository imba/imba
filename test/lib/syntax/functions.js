(function(){
function Paramer(){
	SpecObject.apply(this,arguments);
};
imba$class(Paramer,SpecObject);
Paramer.prototype.req = function (name){
	return [name];
};
Paramer.prototype.req_blk = function (name,blk){
	return [name, blk];
};
Paramer.prototype.req_splat = function (name){
	var $0 = arguments, i = $0.length;
	var items = new Array(i>1 ? i-1 : 0);
	while(i>1) items[--i - 1] = $0[i];;
	return [name, items];
};
Paramer.prototype.opt_blk = function (name,blk){
	if(blk==undefined && typeof name == 'function') blk = name,name = 'anon';;
	return [name, blk];
};
Paramer.prototype.req_opt_blk = function (name,options,blk){
	if(blk==undefined && typeof options == 'function') blk = options,options = {};;
	return [name, options, blk];
};
Paramer.prototype.opt_opt_blk = function (name,options,blk){
	var $0 = arguments, i = $0.length;
	var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
	if(i < 1) name = 'anon';
	if(i < 2) options = {};;
	return [name, options, blk];
};
Paramer.prototype.req_opt_splat_blk = function (name,options){
	var $0 = arguments, i = $0.length;
	var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
	if(i < 2) options = {};
	var items = new Array(i>2 ? i-2 : 0);
	while(i>2) items[--i - 2] = $0[i];;
	return [name, options, items, blk];
};
Paramer.prototype.req_key = function (name,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var gender = pars.gender !== undefined ? pars.gender : 0;
	var age = pars.age !== undefined ? pars.age : 18;;
	return [name, gender, age];
};
Paramer.prototype.req_key_blk = function (name,pars,blk){
	if(blk==undefined && typeof pars == 'function') blk = pars,pars = {};
	else if(!pars||pars.constructor !== Object) pars = {};
	var gender = pars.gender !== undefined ? pars.gender : 0;
	var age = pars.age !== undefined ? pars.age : 18;;
	return [name, gender, age, blk];
};
Paramer.prototype.opt_key_blk = function (name,pars,blk){
	var $0 = arguments, i = $0.length;
	var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
	var pars = $0[i-1]&&$0[i-1].constructor === Object ? $0[--i] : {};
	if(i < 1) name = 'anon';
	var gender = pars.gender !== undefined ? pars.gender : 0;
	var age = pars.age !== undefined ? pars.age : 18;;
	return [name, gender, age, blk];
};
Paramer.prototype.splat_key_blk = function (){
	var $0 = arguments, i = $0.length;
	var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
	var pars = $0[i-1]&&$0[i-1].constructor === Object ? $0[--i] : {};
	var tags = new Array(i>0 ? i : 0);
	while(i>0) tags[i-1] = $0[--i];
	var gender = pars.gender !== undefined ? pars.gender : 0;
	var age = pars.age !== undefined ? pars.age : 18;;
	return [tags, gender, age, blk];
};
Paramer.prototype.opt = function (name){
	if(name === undefined) name = 'anon';;
	return name;
};;
describe('Syntax - Functions',function (){
	var obj = new Paramer();
	var blk = function (){
		return true;
	};
	var res = null;
	test("methods",function (){
		eq(obj.req('john'),['john']);
		eq(obj.req_blk('john',blk),['john', blk]);
		eq(obj.req_opt_blk('john',blk),['john', {}, blk]);
		eq(obj.req_opt_blk('john',{opt: 10},blk),['john', {opt: 10}, blk]);
		eq(obj.req_opt_blk('john',{opt: 10}),['john', {opt: 10}, undefined]);
		eq(obj.opt_opt_blk(blk),['anon', {}, blk]);
		eq(obj.opt_opt_blk('john',blk),['john', {}, blk]);
		eq(obj.opt_opt_blk('john',{opt: 10},blk),['john', {opt: 10}, blk]);
		res = obj.req_opt_splat_blk('john',blk);
		eq(res,['john', {}, [], blk]);
		res = obj.req_opt_splat_blk('john',{opt: 10},blk);
		eq(res,['john', {opt: 10}, [], blk]);
		res = obj.req_opt_splat_blk('john');
		eq(res,['john', {}, [], undefined]);
		res = obj.req_opt_splat_blk('john',{opt: 10},10,11,12,blk);
		eq(res,['john', {opt: 10}, [10, 11, 12], blk]);
		res = obj.req_splat('john',1,2,3);
		eq(res,['john', [1, 2, 3]]);
		eq(obj.opt(),'anon');
		eq(obj.opt(null),null);
		eq(obj.opt(undefined),'anon');
		return ;
	});
	test("keyword arguments",function (){
		res = obj.req_key('john',{age: 20});
		eq(res,['john', 0, 20]);
		res = obj.req_key('john');
		eq(res,['john', 0, 18]);
		res = obj.req_key_blk('john',blk);
		eq(res,['john', 0, 18, blk]);
		res = obj.req_key_blk('john',{gender: 1},blk);
		eq(res,['john', 1, 18, blk]);
		res = obj.opt_key_blk({gender: 1},blk);
		eq(res,['anon', 1, 18, blk]);
		res = obj.opt_key_blk(blk);
		eq(res,['anon', 0, 18, blk]);
		res = obj.opt_key_blk('john',{age: 20});
		eq(res,['john', 0, 20, null]);
		res = obj.splat_key_blk(1,2,3,{age: 20});
		eq(res,[[1, 2, 3], 0, 20, null]);
		res = obj.splat_key_blk(1,2,3,{gender: 1},blk);
		eq(res,[[1, 2, 3], 1, 18, blk]);
		res = obj.splat_key_blk({gender: 1},blk);
		eq(res,[[], 1, 18, blk]);
		res = obj.splat_key_blk();
		eq(res,[[], 0, 18, null]);
		res = obj.splat_key_blk(1,2,3);
		eq(res,[[1, 2, 3], 0, 18, null]);
		res = obj.splat_key_blk(1,2,3,blk);
		return eq(res,[[1, 2, 3], 0, 18, blk]);
	});
	return test("basic lambdas",function (){
		var fn = function (){
			return 1;
		};
		eq(fn(),1);
		fn = function (a){
			return 1 + a;
		};
		eq(fn(0),1);
		eq(fn(1),2);
		fn = function (a,b){
			return a + b;
		};
		eq(fn(1,1),2);
		eq(fn(2,3),5);
		fn = function (a,b,c){
			if(c === undefined) c = 2;;
			return a + b + c;
		};
		eq(fn(1,1),4);
		eq(fn(1,1,1),3);
		fn = function (a,b,c){
			var $0 = arguments, i = $0.length;
			var d = new Array(i>3 ? i-3 : 0);
			while(i>3) d[--i - 3] = $0[i];;
			return [a, b, c, d];
		};
		eq(fn(1,2,3,4,5),[1, 2, 3, [4, 5]]);
		var outer = function (){
			var $0 = arguments, i = $0.length;
			var args = new Array(i>0 ? i : 0);
			while(i>0) args[i-1] = $0[--i];;
			return args;
		};
		var inner = function (blk){
			return (blk) ? (blk()) : (null);
		};
		var v = outer(5,inner(),function (){
			return 10;
		});
		return eq(v,[5, 10]);
	});
});
}())