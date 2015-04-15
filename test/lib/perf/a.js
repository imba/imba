(function(){


	/* @class A */
	function A(x,y,z){
		this._x = x;
		this._y = y;
		this._z = z;
	};
	
	exports.A = A;
	
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

}())