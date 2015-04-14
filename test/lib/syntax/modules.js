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
	
	var $1;
	$1=require('./module');
	var Item = $1.Item;
	var hello = $1.hello;
	
	// import everything from module into a local namespace/variable 'm'
	var m = require('./module');
	
	/* @class Sub */
	function Sub(){ Item.apply(this,arguments) };
	
	subclass$(Sub,Item);
	Sub.prototype.name = function (){
		return "sub" + Sub.__super__.name.apply(this,arguments);
	};
	
	
	
	describe("Syntax - Modules",function (){
		
		return test("modules",function (){
			var item = new Item();
			eq(item.name(),"item");
			
			item = new m.Item();
			eq(item.name(),"item");
			
			eq(m.Item,Item);
			
			eq(hello(),"world");
			
			
			// subclassing an imported class
			var sub = new Sub();
			eq(sub.name(),"subitem");
			
			
			eq(new m.A().name(),"a");
			return eq(new m.B().name(),"b");
		});
	});
	
	
	module.exports.Item = Item;
	


}())