// externs;

// a place to test weird bugs
describe("Syntax - Quirks",function() {
	
	test("let item = try",function() {
		var item = 20;
		item;
		try {
			item = 1000;
		} catch (e) { };
		return eq(item,1000);
	});
	
	test("let item = try catch",function() {
		
		let item;
		try {
			Math.rendom(); // error
			item = 1000;
		} catch (e) {
			item = 2000;
		};
		
		return eq(item,2000);
	});
	
	test("let if",function() {
		let item;
		if (Math.random()) {
			for (let i = 0, items = [1,2,3], len = items.length, item; i < len; i++) {
				item = items[i];
				item * item * item;
			};
			item = 1000;
		} else {
			item = 1000;
		};
		
		return eq(item,1000);
	});
	
	return test("let item = forin",function() {
		let item;
		let res = [];
		for (let i = 0, items = [1,2,3], len = items.length; i < len; i++) {
			res.push(items[i] * 2);
		};
		item = res;
		return eq(item,[2,4,6]);
	});
});
