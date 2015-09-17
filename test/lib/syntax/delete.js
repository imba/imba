(function(){
	var self=this;
	self.describe('Syntax - Delete',function() {
		
		return self.test("should return value",function() {
			var v_;
			var obj = {name: "John",age: 20};
			var age = (((v_ = obj.age),delete obj.age, v_));
			self.eq(age,20);
			return self.eq(obj.age,undefined);
		});
	});

})()