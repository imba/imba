(function(){


	describe('Syntax - Delete',function (){
		return test("should return value",function (){
			var v_;
			var obj = {name: "John",age: 20};
			var age = (((v_ = obj.age),delete obj.age, v_));
			eq(age,20);
			return eq(obj.age,undefined);
		});
	});


}())