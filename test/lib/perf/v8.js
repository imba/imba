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
	
	function time(name,blk){
		console.time(name);
		blk();
		return console.timeEnd(name);
	};
	
	function block(blk){
		return blk();
	};
	
	
	/* @class A */
	function A(x,y,z){
		this._x = x;
		this._y = y;
		this._z = z;
	};
	
	
	
	A.prototype.invoke1 = function (){
		return this._x + this.invoke2();
	};
	
	A.prototype.invoke2 = function (){
		return this._y + this._z;
	};
	
	A.prototype.mono = function (){
		return this.invoke1();
	};
	
	A.prototype.poly = function (){
		return this.invoke1();
	};
	
	
	/* @class B */
	function B(){ A.apply(this,arguments) };
	
	subclass$(B,A);
	B.prototype.mono = function (){
		return this._x + this._y + this._z;
	};
	
	B.prototype.poly = function (){
		return this.invoke1();
	};
	
	
	/* @class C */
	function C(x,y,z){
		this._x = x;
		this._y = y;
		this._z = z;
	};
	
	subclass$(C,A);
	
	
	
	// 
	// 	def invoke2
	// 		@y
	
	
	COUNT = 100000000;
	
	// console.time("bench")
	// 
	// var count = 50000000
	// var a = A.new(1,2,3)
	// var sum = 0
	// 
	// while --count > 0
	// 	sum += a.invoke1
	// 
	// console.log sum
	// console.timeEnd("bench")
	
	
	time("only A",function (){
		var count = COUNT;
		var a = new A(1,2,3);
		var sum = 0;
		
		while(--count > 0){
			sum += a.mono();
			sum += a.mono();
		};
		return console.log(sum);
	});
	
	
	time("only B",function (){
		var count = COUNT;
		var b = new B(1,2,3);
		var sum = 0;
		
		while(--count > 0){
			sum += b.mono();
			sum += b.mono();
		};
		return console.log(sum);
	});
	
	time("A + B",function (){
		var count = COUNT;
		var a = new A(1,2,3);
		var b = new B(1,2,3);
		var sum = 0;
		
		while(--count > 0){
			sum += a.mono();
			sum += b.mono();
		};
		return console.log(sum);
	});
	
	time("A + B poly",function (){
		var count = COUNT;
		var a = new A(1,2,3);
		var b = new B(1,2,3);
		var sum = 0;
		
		while(--count > 0){
			sum += a.poly();
			sum += b.poly();
		};
		return console.log(sum);
	});
	
	time("A + B new poly",function (){
		var count = 10000000;
		
		var sum = 0;
		
		while(--count > 0){
			var a = new A(1,2,3);
			var b = new B(1,2,3);
			
			sum += a.poly();
			sum += b.poly();
		};
		return console.log(sum);
	});
	
	
	time("A + C new poly",function (){
		var count = 10000000;
		
		var sum = 0;
		
		while(--count > 0){
			var a = new A(1,2,3);
			var b = new C(1,2,3);
			
			sum += a.poly();
			sum += b.poly();
		};
		return console.log(sum);
	});
	
	// block do
	// console.time("b")
	// var count = 50000000
	// var a = A.new(1,2,3)
	// var sum = 0
	// 
	// while --count > 0
	// 	sum += a.invoke1
	// console.log sum
	// console.timeEnd("b")
	
	// time "b2" do
	// 
	// 	var count = 50000000
	// 	var a = A.new(1,2,3)
	// 	var sum = 0
	// 
	// 	while --count > 0
	// 		sum += a.invoke1
	// 	console.log sum
	// 
	// // Feed information into the ICs for each function
	// for (var i = 0; i < count; i++) {
	//   f1.invoke1(1);
	//   f2.invoke2(1);
	// 
	//   // The IC for invoke3 will get two different hidden class entries, which deoptimizes it
	//   if (i % 2 == 0)
	//     f1.invoke3(1);
	//   else
	//     f2.invoke3(1);
	// }
	// 
	// console.timeEnd("bench")


}())