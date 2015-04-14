(function(){


	// helper for subclassing
	function subclass$(obj,sup) {
		for (var k in sup) {
			if (sup.hasOwnProperty(k)) obj[k] = sup[k];
		};
		// obj.__super__ = sup;
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
	};
	
	/* @class Paramer */
	function Paramer(){ SpecObject.apply(this,arguments) };
	
	subclass$(Paramer,SpecObject);
	Paramer.prototype.blk = function (blk){
		return [blk];
	};
	
	Paramer.prototype.req = function (name){
		return [name];
	};
	
	Paramer.prototype.req_blk = function (name,blk){
		return [name,blk];
	};
	
	Paramer.prototype.req_splat = function (name){
		var $0 = arguments, i = $0.length;
		var items = new Array(i>1 ? i-1 : 0);
		while(i>1) items[--i - 1] = $0[i];
		return [name,items];
	};
	
	Paramer.prototype.opt_blk = function (name,blk){
		if(blk==undefined && typeof name == 'function') blk = name,name = 'anon';
		return [name,blk];
	};
	
	Paramer.prototype.req_opt_blk = function (name,options,blk){
		if(blk==undefined && typeof options == 'function') blk = options,options = {};
		return [name,options,blk];
	};
	
	Paramer.prototype.opt_opt_blk = function (name,options,blk){
		var $0 = arguments, i = $0.length;
		var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
		if(i < 1) name = 'anon';
		if(i < 2) options = {};
		return [name,options,blk];
	};
	
	Paramer.prototype.req_opt_splat_blk = function (name,options){
		var $0 = arguments, i = $0.length;
		var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
		if(i < 2) options = {};
		var items = new Array(i>2 ? i-2 : 0);
		while(i>2) items[--i - 2] = $0[i];
		return [name,options,items,blk];
	};
	
	Paramer.prototype.req_key = function (name,pars){
		// m('john', age: 20)
		if(!pars||pars.constructor !== Object) pars = {};
		var gender = pars.gender !== undefined ? pars.gender : 0;
		var age = pars.age !== undefined ? pars.age : 18;
		return [name,gender,age];
	};
	
	Paramer.prototype.req_key_blk = function (name,pars,blk){
		// m(age: 20)
		if(blk==undefined && typeof pars == 'function') blk = pars,pars = {};
		else if(!pars||pars.constructor !== Object) pars = {};
		var gender = pars.gender !== undefined ? pars.gender : 0;
		var age = pars.age !== undefined ? pars.age : 18;
		return [name,gender,age,blk];
	};
	// if the arg is an actual options-block I guess we should check for this first
	
	Paramer.prototype.opt_key_blk = function (name,pars,blk){
		// m(age: 20)
		// m('john', age: 20) # should work
		var $0 = arguments, i = $0.length;
		var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
		var pars = $0[i-1]&&$0[i-1].constructor === Object ? $0[--i] : {};
		if(i < 1) name = 'anon';
		var gender = pars.gender !== undefined ? pars.gender : 0;
		var age = pars.age !== undefined ? pars.age : 18;
		return [name,gender,age,blk];
	};
	
	Paramer.prototype.splat_key_blk = function (){
		var $0 = arguments, i = $0.length;
		var blk = typeof $0[i-1] == 'function' ? $0[--i] : null;
		var pars = $0[i-1]&&$0[i-1].constructor === Object ? $0[--i] : {};
		var tags = new Array(i>0 ? i : 0);
		while(i>0) tags[i-1] = $0[--i];
		var gender = pars.gender !== undefined ? pars.gender : 0;
		var age = pars.age !== undefined ? pars.age : 18;
		return [tags,gender,age,blk];
	};
	
	Paramer.prototype.opt = function (name){
		if(name === undefined) name = 'anon';
		return name;
	};
	
	
	
		
		Number.prototype.num_meth = function (){
			return true;
		};
	
	
	
	describe('Syntax - Functions',function (){
		
		var obj = new Paramer();
		var blk = function (){
			return true;
		};
		var res = null;
		
		test("methods",function (){
			// basic arguments works
			eq(obj.req('john'),['john']);
			eq(obj.blk(blk),[blk]);
			
			eq(obj.req_blk('john',blk),['john',blk]);
			
			// options will be set to default, blk will be correctly set
			eq(obj.req_opt_blk('john',blk),['john',{},blk]);
			
			// if we supply options to method, blk is still specified
			eq(obj.req_opt_blk('john',{opt: 10},blk),['john',{opt: 10},blk]);
			
			// only set blk if it is a function
			eq(obj.req_opt_blk('john',{opt: 10}),['john',{opt: 10},undefined]);
			
			// should work for two optionals as well
			eq(obj.opt_opt_blk(blk),['anon',{},blk]);
			
			// should work for two optionals as well
			eq(obj.opt_opt_blk('john',blk),['john',{},blk]);
			eq(obj.opt_opt_blk('john',{opt: 10},blk),['john',{opt: 10},blk]);
			
			res = obj.req_opt_splat_blk('john',blk);
			eq(res,['john',{},[],blk]);
			
			res = obj.req_opt_splat_blk('john',{opt: 10},blk);
			eq(res,['john',{opt: 10},[],blk]);
			
			res = obj.req_opt_splat_blk('john');
			eq(res,['john',{},[],undefined]);
			
			res = obj.req_opt_splat_blk('john',{opt: 10},10,11,12,blk);
			eq(res,['john',{opt: 10},[10,11,12],blk]);
			
			res = obj.req_splat('john',1,2,3);
			eq(res,['john',[1,2,3]]);
			
			// optional arguments
			eq(obj.opt(),'anon');
			
			// null overrides the default argument
			eq(obj.opt(null),null);
			
			// undefined is like sending on argument
			return eq(obj.opt(undefined),'anon');
		});
		
		test("keyword arguments",function (){
			// [name,gender,age]
			res = obj.req_key('john',{age: 20});
			eq(res,['john',0,20]);
			
			res = obj.req_key('john');
			eq(res,['john',0,18]);
			
			// keywords are optional, and block is greedy
			// req_key_blk name, gender: 0, age: 18, &blk
			res = obj.req_key_blk('john',blk);
			eq(res,['john',0,18,blk]);
			
			res = obj.req_key_blk('john',{gender: 1},blk);
			eq(res,['john',1,18,blk]);
			
			// opt_key_blk name = 'anon', gender: 0, age: 18, &blk
			res = obj.opt_key_blk({gender: 1},blk);
			eq(res,['anon',1,18,blk]);
			
			res = obj.opt_key_blk(blk);
			eq(res,['anon',0,18,blk]);
			
			res = obj.opt_key_blk('john',{age: 20});
			eq(res,['john',0,20,null]);
			
			// splat_key_blk *tags, gender: 0, age: 18, &blk
			res = obj.splat_key_blk(1,2,3,{age: 20});
			eq(res,[[1,2,3],0,20,null]);
			
			res = obj.splat_key_blk(1,2,3,{gender: 1},blk);
			eq(res,[[1,2,3],1,18,blk]);
			
			res = obj.splat_key_blk({gender: 1},blk);
			eq(res,[[],1,18,blk]);
			
			res = obj.splat_key_blk();
			eq(res,[[],0,18,null]);
			
			res = obj.splat_key_blk(1,2,3);
			eq(res,[[1,2,3],0,18,null]);
			
			res = obj.splat_key_blk(1,2,3,blk);
			return eq(res,[[1,2,3],0,18,blk]);
		});
		
		
		test("basic lambdas",function (){
			
			// we use do-syntax fo define basic functions
			var fn = function (){
				return 1;
			};
			eq(fn(),1);
			
			// arguments are defined in do | args |
			fn = function (a){
				return 1 + a;
			};
			
			eq(fn(0),1);
			eq(fn(1),2);
			
			// multiple arguments
			fn = function (a,b){
				return a + b;
			};
			
			eq(fn(1,1),2);
			eq(fn(2,3),5);
			
			// we support default arguments
			fn = function (a,b,c){
				if(c === undefined) c = 2;
				return a + b + c;
			};
			
			eq(fn(1,1),4);
			eq(fn(1,1,1),3);
			
			// splat arguments
			fn = function (a,b,c){
				var $0 = arguments, i = $0.length;
				var d = new Array(i>3 ? i-3 : 0);
				while(i>3) d[--i - 3] = $0[i];
				return [a,b,c,d];
			};
			
			eq(fn(1,2,3,4,5),[1,2,3,[4,5]]);
			
			var outer = function (){
				var $0 = arguments, i = $0.length;
				var args = new Array(i>0 ? i : 0);
				while(i>0) args[i-1] = $0[--i];
				return args;
			};
			
			var inner = function (blk){
				return (blk) ? (blk()) : (null);
			};
			
			// block precedence
			// f1 f2 do 10 -> f1(f2(10))
			var v = outer(5,inner(function (){
				return 10;
			}));
			return eq(v,[5,10]);
		});
		
		return test("methods on numbers",function (){
			return ok((1).num_meth());
		});
	});
	
	
	
	// 	describe 'argvars' do
	// 		test '$0 refers to arguments' do
	// 			var fn = do $0:length
	// 			eq fn(yes,yes,yes), 3
	// 
	// 		test '$i refers to arguments[i-1]' do
	// 			fn = do $1+$2
	// 			eq fn(10,20), 30
	// 
	// 			fn = do |a,b,c|
	// 				eq a, $1
	// 				eq b, $2
	// 				eq c, $3
	// 
	// 			fn()
	// 
	// 	describe 'default arguments' do
	// 
	// 		it 'should work for numbers' do
	// 			fn = do |a,b=1| return b
	// 			eq fn(), 1
	// 			eq fn(0), 1
	// 			eq fn(0,2), 2
	// 
	// 		it 'should work for strings' do
	// 			fn = do |a,b="b"| return b
	// 			eq fn(), "b"
	// 			eq fn(0), "b"
	// 			eq fn(0,"x"), "x"
	// 			eq fn(0,2), 2
	// 
	// 		it 'should work for arrays' do
	// 			fn = do |a,b=[1,2,3]| return b
	// 			eq fn(), [1,2,3]
	// 			eq fn(0,"x"), "x"
	// 			eq fn(0,2), 2
	// 			eq fn(0,[0,1,2]), [0,1,2]
	// 
	// 		it 'should only override null/undefined' do
	// 			fn = do |a,b=1| return b
	// 			eq fn(0,0), 0
	// 			eq fn(0,""), ""
	// 
	// 	
	// 
	// 	describe 'splats' do
	// 
	// 		test 'do |a,...b|' do
	// 			fn = do|a,...b| return [a,b]
	// 			eq fn(0,1,2,3), [0,[1,2,3]]
	// 
	// 			# other syntax
	// 			fn = (|a,...b| return [a,b])
	// 			eq fn(0,1,2,3), [0,[1,2,3]]
	// 
	// 		test 'do |a,...b,c|' do
	// 			fn = do|a,...b,c| return [a,b,c]
	// 			eq fn(0,1,2,3,4), [0,[1,2,3],4]
	// 
	// 			fn = (|a,...b,c| return [a,b,c])
	// 			eq fn(0,1,2,3,4), [0,[1,2,3],4]
	// 
	// 	test 'callbacks' do
	// 		res = [1,2,3].map do |a| a*2
	// 		eq res, [2,4,6]
	// 
	// 		res = [1,2,3].map(|a| a*2)
	// 		eq res, [2,4,6]
	// 
	// 	test 'self-referencing functions' do
	// 		change = do change = 10
	// 		change()
	// 		eq change, 10


}())