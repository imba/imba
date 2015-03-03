(function(){
function ThrowClass(){
	return this;
};
imba$class(ThrowClass);
ThrowClass.prototype.cleanup = function (){
	return this._cleanup;
};
ThrowClass.prototype.setCleanup = function (v){
	return this._cleanup = v;
};;
ThrowClass.prototype.returnBeforeFinally = function (num){
	try {
		10;
		return num * 2;
	}
	finally {
		10;
		this.setCleanup(true);
	};
};;
describe('Syntax - Catch',function (){
	return test("throw catch",function (){
		var res = false;
		var after = false;
		try {
			nometh() * 10;
		}
		catch (e) {
			res = 1;
		}
		;
		ok(res);
		try {
			res = nometh();
		}
		catch (e) {
			res = 2;
		}
		;
		eq(res,2);
		try {
			res = nometh();
		}
		catch (e) {
			res = 2;
		}
		finally {
			after = 3;
		};
		eq(res,2);
		eq(after,3);
		try {
			2;
			throw 10;
		}
		catch (e) {
			res = e + 10;
		}
		;
		eq(res,20);
		try {
			res = 10;
		}
		catch(e){};
		eq(res,10);
		var obj = new ThrowClass();
		eq(obj.returnBeforeFinally(2),4);
		return eq(obj.cleanup(),true);
	});
});
}())