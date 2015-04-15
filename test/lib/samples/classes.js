(function(){


	// really?
	
	
	/* @class A */
	function A(){ };
	
	A.prototype.a = function (){
		return [1,2,3,4,5,6,7,8,9];
	};
	
	A.prototype.b = function (){
		return this.a(this.b(this.c(this.d(this.e(this.f(this.g()))))));
	};
	
	A.prototype.c = function (){
		return {a: 1,b: 2,c: 3,d: 4,e: 5};
	};
	
	A.prototype.d = function (){
		return 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8;
	};
	
	A.prototype.e = function (){
		return 1;
	};
	
	A.prototype.f = function (){
		return 1;
	};
	
	A.prototype.g = function (){
		return 1;
	};
	


}())